import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Details",
  description: "View order details and payment status."
};

type Row = Record<string, unknown>;

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

function objectValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Row) : {};
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value as Row[] : [];
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serverSupabase = await createClient();
  const { data: userData } = serverSupabase ? await serverSupabase.auth.getUser() : { data: { user: null } };
  const supabase = createAdminClient();
  if (!userData.user) redirect(`/account/login?next=/account/orders/${id}`);
  if (!supabase) notFound();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(quantity,unit_price, products(name,slug,images,product_images(public_url,sort_order)))")
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .single();

  if (!order) notFound();
  const row = order as Row;
  const items = arrayValue(row.order_items);

  return (
    <section className="container py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground"><Link href="/account/orders">My Orders</Link> / {text(row.id).slice(0, 8)}</p>
          <h1 className="mt-2 text-4xl font-black">Order Details</h1>
        </div>
        <div className="flex gap-2"><Badge>{text(row.status)}</Badge><Badge variant="outline">{text(row.payment_status)}</Badge></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="text-xl font-bold">Items</h2>
            {items.map((item, index) => {
              const product = objectValue(item.products);
              const productImages = arrayValue(product.product_images);
              const image = productImages.length ? text(productImages[0].public_url) : text((Array.isArray(product.images) ? product.images[0] : ""));
              return (
                <div key={`${text(product.slug)}-${index}`} className="grid gap-4 border-b pb-4 sm:grid-cols-[80px_1fr_auto]">
                  {image ? (
                    <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
                      <Image src={image} alt={text(product.name)} fill className="object-cover" sizes="80px" />
                    </div>
                  ) : <div className="aspect-square rounded-md bg-secondary" />}
                  <div>
                    <Link href={`/products/${text(product.slug)}`} className="font-semibold hover:text-primary">{text(product.name)}</Link>
                    <p className="text-sm text-muted-foreground">Quantity {numberValue(item.quantity)} | {formatCurrency(numberValue(item.unit_price))} each</p>
                  </div>
                  <p className="font-bold">{formatCurrency(numberValue(item.unit_price) * numberValue(item.quantity))}</p>
                </div>
              );
            })}
            <div className="flex justify-between pt-2 text-lg font-black"><span>Total</span><span>{formatCurrency(numberValue(row.total))}</span></div>
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardContent className="space-y-3 p-5">
            <h2 className="text-xl font-bold">Customer & Payment</h2>
            <p className="text-sm"><strong>Name:</strong> {text(row.customer_name)}</p>
            <p className="text-sm"><strong>Email:</strong> {text(row.customer_email)}</p>
            <p className="text-sm"><strong>Phone:</strong> {text(row.customer_phone)}</p>
            <p className="text-sm"><strong>Delivery:</strong> {text(row.delivery_method)}</p>
            <p className="text-sm"><strong>Reference:</strong> {text(row.payment_reference)}</p>
            <p className="text-sm"><strong>Date:</strong> {new Date(text(row.created_at)).toLocaleString()}</p>
            <Button asChild className="w-full"><Link href="/contact">Contact Support</Link></Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
