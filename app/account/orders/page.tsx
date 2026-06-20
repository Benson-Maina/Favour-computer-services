import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View Favour Computer Services order history, statuses, payment status, dates, and totals."
};

type Row = Record<string, unknown>;

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

export default async function OrdersPage() {
  const serverSupabase = await createClient();
  const { data: userData } = serverSupabase ? await serverSupabase.auth.getUser() : { data: { user: null } };
  if (!userData.user) redirect("/account/login?next=/account/orders");
  const supabase = createAdminClient();
  const { data } = supabase && userData.user
    ? await supabase.from("orders").select("*, order_items(id)").eq("user_id", userData.user.id).order("created_at", { ascending: false })
    : { data: [] };
  const orders = data ?? [];

  if (!orders.length) {
    return (
      <section className="container py-16 text-center">
        <PackageSearch className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 text-4xl font-black">No orders yet</h1>
        <p className="mt-2 text-muted-foreground">Signed-in checkout orders from Supabase will appear here.</p>
        <Button asChild className="mt-6"><Link href="/shop">Shop Products</Link></Button>
      </section>
    );
  }

  return (
    <section className="container py-12">
      <h1 className="text-4xl font-black">My Orders</h1>
      <p className="mt-2 text-muted-foreground">Track current and previous Favour Computer Services orders.</p>
      <div className="mt-8 space-y-4">
        {orders.map((order) => {
          const row = order as Row;
          const items = Array.isArray(row.order_items) ? row.order_items : [];
          return (
            <Card key={text(row.id)}>
              <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold">Order {text(row.id).slice(0, 8)}</h2>
                    <Badge>{text(row.status)}</Badge>
                    <Badge variant="outline">{text(row.payment_status)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{new Date(text(row.created_at)).toLocaleDateString()} | {items.length} item{items.length === 1 ? "" : "s"} | {text(row.delivery_method)}</p>
                  <p className="mt-2 font-black">{formatCurrency(numberValue(row.total))}</p>
                </div>
                <Button asChild variant="outline"><Link href={`/account/orders/${text(row.id)}`}>View Details</Link></Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
