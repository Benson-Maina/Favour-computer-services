import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { OrderDetailPanel } from "@/components/admin/order-detail-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { orderStatusLabels } from "@/lib/admin-analytics";
import { getAdminPermissions, requireAdminPage } from "@/lib/admin-auth";
import {
  getOrderPaymentStatus,
  loadOrderById,
  loadOrderNotes,
  loadOrderTimeline,
  loadPaymentForOrder,
  loadPayments
} from "@/lib/admin-data";
import { formatCurrency } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id.slice(0, 8).toUpperCase()}` };
}

export default async function AdminOrderDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  await requireAdminPage("orders:read");
  const { id } = await params;
  const { print } = await searchParams;
  const [order, payments, permissions, timeline, notes, payment] = await Promise.all([
    loadOrderById(id),
    loadPayments(),
    getAdminPermissions(),
    loadOrderTimeline(id),
    loadOrderNotes(id),
    loadPaymentForOrder(id)
  ]);
  if (!order) notFound();

  const paymentStatus = getOrderPaymentStatus(order, payments);
  const isPrint = print === "1";
  const canWriteOrders = permissions.includes("orders:write");
  const canWritePayments = permissions.includes("payments:write");

  return (
    <div className={isPrint ? "print:p-8" : ""}>
      {!isPrint ? (
        <AdminPageHeader title={`Order ${order.id.slice(0, 8).toUpperCase()}`} description={`Placed ${new Date(order.createdAt).toLocaleString()}`} />
      ) : null}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            <Badge>{orderStatusLabels[order.status]}</Badge>
            <Badge variant="outline">Payment: {paymentStatus}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Customer</p>
              <p className="text-sm text-muted-foreground">{order.customerName}</p>
              <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
              <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Delivery</p>
              <p className="text-sm text-muted-foreground capitalize">{order.deliveryMethod}</p>
              {order.shippingAddress ? <p className="text-sm text-muted-foreground">{order.shippingAddress}</p> : null}
              {order.paymentReference ? <p className="text-sm text-muted-foreground">Ref: {order.paymentReference}</p> : null}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Items</p>
            <div className="space-y-2">
              {order.itemsSnapshot.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex justify-between rounded-md border border-border p-3 text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold">{formatCurrency(order.total)}</span>
          </div>
          {!isPrint ? (
            <div className="flex gap-2">
              <Button asChild variant="outline"><Link href="/admin/orders">Back to orders</Link></Button>
              <Button asChild><Link href={`/admin/orders/${order.id}?print=1`} target="_blank">Print receipt</Link></Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
      {!isPrint ? (
        <div className="mt-6">
          <OrderDetailPanel
            order={order}
            payment={payment}
            timeline={timeline}
            notes={notes}
            canWriteOrders={canWriteOrders}
            canWritePayments={canWritePayments}
          />
        </div>
      ) : null}
      {isPrint ? <script dangerouslySetInnerHTML={{ __html: "window.print()" }} /> : null}
    </div>
  );
}
