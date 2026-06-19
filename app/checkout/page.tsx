import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout-page-client";
import { getBusinessSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete checkout with Paybill payment verification."
};

export default async function CheckoutPage() {
  const business = await getBusinessSettings();
  return <CheckoutPageClient business={business} />;
}
