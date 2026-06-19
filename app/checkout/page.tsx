import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout-page-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete checkout with Paybill payment verification."
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
