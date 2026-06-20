import type { Order } from "@/lib/types";

export const orderStatusLabels: Record<Order["status"], string> = {
  pending_payment: "Pending Payment",
  payment_submitted: "Payment Submitted",
  payment_verified: "Payment Verified",
  processing: "Processing",
  ready_for_pickup: "Ready For Pickup",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled"
};

export const orderStatuses = Object.keys(orderStatusLabels) as Order["status"][];
