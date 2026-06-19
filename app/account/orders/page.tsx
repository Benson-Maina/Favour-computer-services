import type { Metadata } from "next";
import { OrdersPageClient } from "@/components/orders-page-client";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View Favour Computer Services order history, statuses, payment status, dates, and totals."
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
