import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart-page-client";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Favour Computer Services cart before checkout."
};

export default function CartPage() {
  return <CartPageClient />;
}
