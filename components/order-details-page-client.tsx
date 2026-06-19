"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStoredOrders, type StoredOrder } from "@/lib/orders-storage";
import { formatCurrency } from "@/lib/utils";

export function OrderDetailsPageClient({ id }: { id: string }) {
  const [order, setOrder] = useState<StoredOrder | null | undefined>(undefined);

  useEffect(() => {
    setOrder(getStoredOrders().find((item) => item.id === id) ?? null);
  }, [id]);

  if (order === undefined) {
    return <section className="container py-12"><div className="h-72 rounded-md bg-secondary" /></section>;
  }

  if (order === null) notFound();

  return (
    <section className="container py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground"><Link href="/account/orders">My Orders</Link> / {order.id.slice(0, 8)}</p>
          <h1 className="mt-2 text-4xl font-black">Order Details</h1>
        </div>
        <div className="flex gap-2"><Badge>{order.status}</Badge><Badge variant="outline">{order.paymentStatus}</Badge></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="text-xl font-bold">Items</h2>
            {order.items.map((item) => (
              <div key={item.productId} className="grid gap-4 border-b pb-4 sm:grid-cols-[80px_1fr_auto]">
                <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                </div>
                <div>
                  <Link href={`/products/${item.slug}`} className="font-semibold hover:text-primary">{item.name}</Link>
                  <p className="text-sm text-muted-foreground">Quantity {item.quantity} · {formatCurrency(item.price)} each</p>
                </div>
                <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
            <div className="flex justify-between pt-2 text-lg font-black"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardContent className="space-y-3 p-5">
            <h2 className="text-xl font-bold">Customer & Payment</h2>
            <p className="text-sm"><strong>Name:</strong> {order.customerName}</p>
            <p className="text-sm"><strong>Email:</strong> {order.customerEmail}</p>
            <p className="text-sm"><strong>Phone:</strong> {order.customerPhone}</p>
            <p className="text-sm"><strong>Delivery:</strong> {order.deliveryMethod}</p>
            <p className="text-sm"><strong>Reference:</strong> {order.paymentReference}</p>
            <p className="text-sm"><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <Button asChild className="w-full"><Link href="/contact">Contact Support</Link></Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
