import type { Metadata } from "next";
import { OrderDetailsPageClient } from "@/components/order-details-page-client";

export const metadata: Metadata = {
  title: "Order Details",
  description: "View order details and payment status."
};

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailsPageClient id={id} />;
}
