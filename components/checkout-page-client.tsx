"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { submitCheckout } from "@/app/actions";
import { SocialLinksIcons } from "@/components/social-links";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import type { BusinessSettings } from "@/lib/data";

type State = { ok: boolean; message: string; orderId?: string; customerName?: string; customerEmail?: string; paymentReference?: string };

export function CheckoutPageClient({ business }: { business: BusinessSettings }) {
  const { items, subtotal, hydrated, clearCart } = useCart();
  const orderId = useMemo(() => crypto.randomUUID(), []);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(submitCheckout, { ok: false, message: "" } satisfies State);

  useEffect(() => {
    if (!state.message) return;
    if (!state.ok) {
      toast.error(state.message);
      return;
    }

    toast.success("Order placed successfully");
    clearCart();
  }, [clearCart, state]);

  if (!hydrated) {
    return <section className="container py-12"><div className="h-96 rounded-md bg-secondary" /></section>;
  }

  if (!items.length) {
    if (state.ok && state.orderId) {
      return (
        <section className="container grid min-h-[60vh] place-items-center py-16 text-center">
          <Card className="w-full max-w-xl">
            <CardContent className="p-8">
              <h1 className="text-4xl font-black">Order Submitted</h1>
              <p className="mt-3 text-muted-foreground">Your order was saved and is awaiting Paybill verification.</p>
              <div className="mt-6 rounded-md bg-secondary p-4 text-left text-sm">
                <p><strong>Order ID:</strong> {state.orderId}</p>
                <p><strong>Payment reference:</strong> {state.paymentReference}</p>
                <p><strong>Email:</strong> {state.customerEmail}</p>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild><Link href="/shop">Continue Shopping</Link></Button>
                <Button asChild variant="outline"><Link href="/account/orders">View Account Orders</Link></Button>
              </div>
              <div className="mt-6 flex justify-center">
                <SocialLinksIcons links={business.socialLinks} />
              </div>
            </CardContent>
          </Card>
        </section>
      );
    }
    return (
      <section className="container py-16 text-center">
        <h1 className="text-4xl font-black">Checkout</h1>
        <p className="mt-2 text-muted-foreground">Your cart is empty. Add products before checkout.</p>
        <Button asChild className="mt-6"><Link href="/shop">Shop Products</Link></Button>
      </section>
    );
  }

  const checkoutItems = items.map((item) => ({ productId: item.productId, name: item.name, quantity: item.quantity, price: item.price }));

  return (
    <section className="container grid gap-8 py-12 lg:grid-cols-[1fr_420px]">
      <Card>
        <CardContent className="p-6">
          <h1 className="mb-2 text-3xl font-black">Checkout</h1>
          <p className="mb-6 text-muted-foreground">Complete Paybill payment, enter your transaction reference, and submit the order for verification.</p>
          <form ref={formRef} action={formAction} className="space-y-4">
            <input type="hidden" name="orderId" value={orderId} />
            <input type="hidden" name="items" value={JSON.stringify(checkoutItems)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="name" placeholder="Full name" aria-label="Full name" required minLength={2} />
              <Input name="email" type="email" placeholder="Email" aria-label="Email" required />
            </div>
            <Input name="phone" placeholder="Phone" aria-label="Phone" required minLength={7} />
            <select name="deliveryMethod" aria-label="Delivery method" className="h-10 w-full rounded-md border bg-background px-3 text-sm" required>
              <option value="pickup">Physical Shop Pickup</option>
              <option value="delivery">Online Order Delivery</option>
              <option value="whatsapp">WhatsApp Order Follow-up</option>
            </select>
            <Textarea name="address" placeholder="Shipping address or pickup notes" aria-label="Shipping address or pickup notes" />
            <Input name="paymentReference" placeholder="M-Pesa transaction code or reference" aria-label="Payment reference" required minLength={3} />
            <Input name="paymentScreenshot" type="file" accept="image/*,.pdf" aria-label="Payment screenshot" />
            <Textarea name="notes" placeholder="Additional notes" aria-label="Additional notes" />
            <Button disabled={pending} className="w-full">
              {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <LockKeyhole className="mr-2 size-4" />}
              {pending ? "Placing Order..." : "Submit Order"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-5">
        <Card>
          <CardContent className="space-y-3 p-5">
            <h2 className="text-xl font-bold">Payment Instructions</h2>
            <p className="text-sm text-muted-foreground">Complete your payment using the Paybill Number below before submitting checkout.</p>
            <div className="rounded-md bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Paybill Number</p>
              <p className="text-2xl font-black">{business.paybill}</p>
              <p className="mt-3 text-sm text-muted-foreground">Account Number</p>
              <p className="text-xl font-bold">{business.account}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-5">
            <h2 className="text-xl font-bold">Order Summary</h2>
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between gap-4 text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-3 font-bold"><span>Total</span><span>{formatCurrency(subtotal)}</span></div>
            <p className="text-xs text-muted-foreground">Order status starts as Payment Submitted.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
