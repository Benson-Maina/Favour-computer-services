"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStoredOrders, type StoredOrder } from "@/lib/orders-storage";
import { formatCurrency } from "@/lib/utils";

export function OrdersPageClient() {
  const [orders, setOrders] = useState<StoredOrder[] | null>(null);

  useEffect(() => setOrders(getStoredOrders()), []);

  if (!orders) {
    return <section className="container py-12"><div className="h-72 rounded-md bg-secondary" /></section>;
  }

  if (!orders.length) {
    return (
      <section className="container py-16 text-center">
        <PackageSearch className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 text-4xl font-black">No orders yet</h1>
        <p className="mt-2 text-muted-foreground">Your completed checkout orders will appear here.</p>
        <Button asChild className="mt-6"><Link href="/shop">Shop Products</Link></Button>
      </section>
    );
  }

  return (
    <section className="container py-12">
      <h1 className="text-4xl font-black">My Orders</h1>
      <p className="mt-2 text-muted-foreground">Track current and previous Favour Computer Services orders.</p>
      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold">Order {order.id.slice(0, 8)}</h2>
                  <Badge>{order.status}</Badge>
                  <Badge variant="outline">{order.paymentStatus}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length === 1 ? "" : "s"} · {order.deliveryMethod}</p>
                <p className="mt-2 font-black">{formatCurrency(order.total)}</p>
              </div>
              <Button asChild variant="outline"><Link href={`/account/orders/${order.id}`}>View Details</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
