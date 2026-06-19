"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";

export function CartPageClient() {
  const { items, subtotal, totalItems, hydrated, increaseItem, decreaseItem, removeItem, clearCart } = useCart();

  if (!hydrated) {
    return <section className="container py-12"><div className="h-72 rounded-md bg-secondary" /></section>;
  }

  if (!items.length) {
    return (
      <section className="container py-16 text-center">
        <ShoppingCart className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 text-4xl font-black">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add products from the shop to begin checkout.</p>
        <Button asChild className="mt-6"><Link href="/shop">Shop Now</Link></Button>
      </section>
    );
  }

  return (
    <section className="container py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black">Cart</h1>
          <p className="text-muted-foreground">{totalItems} item{totalItems === 1 ? "" : "s"} ready for checkout.</p>
        </div>
        <Button variant="outline" onClick={clearCart}><Trash2 className="mr-2 size-4" />Clear Cart</Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="grid gap-4 p-4 sm:grid-cols-[120px_1fr_auto]">
                <Link href={`/products/${item.slug}`} className="relative aspect-square overflow-hidden rounded-md bg-secondary">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="120px" />
                </Link>
                <div>
                  <Link href={`/products/${item.slug}`} className="font-bold hover:text-primary">{item.name}</Link>
                  <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(item.price)} each · {item.stock} available</p>
                  <div className="mt-4 flex w-fit items-center rounded-md border">
                    <Button variant="ghost" size="icon" aria-label={`Decrease ${item.name}`} onClick={() => decreaseItem(item.productId)}><Minus className="size-4" /></Button>
                    <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                    <Button variant="ghost" size="icon" aria-label={`Increase ${item.name}`} onClick={() => increaseItem(item.productId)}><Plus className="size-4" /></Button>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <p className="font-black">{formatCurrency(item.price * item.quantity)}</p>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.productId)}><Trash2 className="mr-2 size-4" />Remove</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="h-fit">
          <CardContent className="space-y-4 p-5">
            <h2 className="text-xl font-bold">Order Summary</h2>
            <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div className="flex justify-between text-sm text-muted-foreground"><span>Delivery</span><span>Confirmed at checkout</span></div>
            <p className="text-sm text-muted-foreground">Paybill payment is verified by admin after you submit the reference.</p>
            <Button asChild className="w-full"><Link href="/checkout">Proceed to Checkout</Link></Button>
            <Button asChild variant="outline" className="w-full"><Link href="/shop">Continue Shopping</Link></Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
