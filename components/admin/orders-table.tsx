"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/actions";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminSelect } from "@/components/admin/admin-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { orderStatusLabels, orderStatuses } from "@/lib/admin-analytics";
import { getOrderPaymentStatus } from "@/lib/admin-data";
import type { Order, Payment } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function OrdersTable({
  orders,
  payments,
  canWrite,
  initialSearch = ""
}: {
  orders: Order[];
  payments: Payment[];
  canWrite: boolean;
  initialSearch?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function updateStatus(orderId: string, status: string) {
    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("status", status);
    startTransition(async () => {
      const result = await updateOrderStatus({ ok: false, message: "" }, formData);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  return (
    <AdminDataTable
      rows={orders}
      searchPlaceholder="Search order #, customer, email..."
      getSearchText={(row) => `${row.id} ${row.customerName} ${row.customerEmail} ${row.customerPhone}`}
      filters={[
        {
          key: "status",
          label: "All statuses",
          options: orderStatuses.map((status) => ({ label: orderStatusLabels[status], value: status })),
          match: (row, value) => row.status === value
        },
        {
          key: "payment",
          label: "All payments",
          options: [
            { label: "Pending", value: "Pending" },
            { label: "Submitted", value: "Submitted" },
            { label: "Paid", value: "Paid" },
            { label: "Rejected", value: "Rejected" },
            { label: "Cancelled", value: "Cancelled" }
          ],
          match: (row, value) => getOrderPaymentStatus(row, payments) === value
        }
      ]}
      columns={[
        {
          key: "order",
          header: "Order",
          sortable: true,
          sortValue: (row) => row.createdAt,
          render: (row) => (
            <div>
              <p className="font-mono text-xs font-semibold">{row.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</p>
            </div>
          )
        },
        {
          key: "customer",
          header: "Customer",
          sortable: true,
          sortValue: (row) => row.customerName,
          render: (row) => (
            <div>
              <p className="font-medium">{row.customerName}</p>
              <p className="text-xs text-muted-foreground">{row.customerEmail}</p>
            </div>
          )
        },
        {
          key: "amount",
          header: "Amount",
          sortable: true,
          sortValue: (row) => row.total,
          render: (row) => formatCurrency(row.total)
        },
        {
          key: "payment",
          header: "Payment",
          render: (row) => <Badge variant="outline">{getOrderPaymentStatus(row, payments)}</Badge>
        },
        {
          key: "status",
          header: "Order Status",
          render: (row) => <Badge>{orderStatusLabels[row.status]}</Badge>
        },
        {
          key: "actions",
          header: "Actions",
          className: "text-right",
          render: (row) => (
            <div className="flex flex-wrap justify-end gap-1">
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/orders/${row.id}`}>View</Link>
              </Button>
              {canWrite ? (
                <AdminSelect
                  defaultValue={row.status}
                  className="h-8 w-auto min-w-[140px] text-xs"
                  onChange={(event) => updateStatus(row.id, event.target.value)}
                  disabled={pending}
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>{orderStatusLabels[status]}</option>
                  ))}
                </AdminSelect>
              ) : null}
              <Button asChild size="sm" variant="ghost">
                <Link href={`/admin/orders/${row.id}?print=1`} target="_blank">Print</Link>
              </Button>
            </div>
          )
        }
      ]}
      emptyTitle="No orders yet."
      initialSearch={initialSearch}
    />
  );
}
