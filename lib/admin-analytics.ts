import { addDays, format, parseISO, startOfDay } from "date-fns";
import { bookingsSample, orders, payments, products } from "@/lib/data";
import type { ChartPoint, Order } from "@/lib/types";

export const orderStatusLabels: Record<Order["status"], string> = {
  pending_payment: "Pending Payment",
  payment_submitted: "Payment Submitted",
  payment_verified: "Payment Verified",
  processing: "Processing",
  ready_for_pickup: "Ready For Pickup",
  completed: "Completed",
  cancelled: "Cancelled"
};

export const orderStatuses = Object.keys(orderStatusLabels) as Order["status"][];

function dayKey(date: string) {
  return format(parseISO(date), "MMM d");
}

export function getAdminMetrics() {
  const completedOrders = orders.filter((order) => order.status === "completed" || order.status === "payment_verified");
  const pendingOrders = orders.filter((order) => ["pending_payment", "payment_submitted"].includes(order.status));
  const uniqueCustomers = new Set(orders.map((order) => order.customerEmail.toLowerCase()));
  bookingsSample.forEach((booking) => uniqueCustomers.add(booking.email.toLowerCase()));

  return {
    totalOrders: orders.length,
    totalRevenue: completedOrders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: pendingOrders.length,
    completedOrders: completedOrders.length,
    totalCustomers: uniqueCustomers.size,
    totalProducts: products.length,
    submittedPayments: payments.filter((payment) => !payment.verified && !payment.rejected).length,
    lowStockProducts: products.filter((product) => product.stock <= product.lowStockThreshold).length
  };
}

export function getRevenueChart(): ChartPoint[] {
  const grouped = new Map<string, number>();
  orders.forEach((order) => grouped.set(dayKey(order.createdAt), (grouped.get(dayKey(order.createdAt)) ?? 0) + order.total));
  return Array.from(grouped, ([name, revenue]) => ({ name, revenue }));
}

export function getOrdersChart(): ChartPoint[] {
  return orderStatuses.map((status) => ({
    name: orderStatusLabels[status],
    orders: orders.filter((order) => order.status === status).length
  }));
}

export function getCustomerGrowthChart(): ChartPoint[] {
  const start = startOfDay(new Date("2026-06-14"));
  return Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(start, index);
    const customers = orders.filter((order) => parseISO(order.createdAt) <= date).length + bookingsSample.filter((booking) => parseISO(booking.createdAt) <= date).length;
    return { name: format(date, "MMM d"), customers };
  });
}

export function getProductPerformanceChart(): ChartPoint[] {
  return products
    .map((product) => ({
      name: product.name.replace(" Core ", " "),
      units: product.unitsSold ?? Math.max(1, Math.floor(product.reviewCount / 4)),
      stock: product.stock
    }))
    .sort((a, b) => (b.units ?? 0) - (a.units ?? 0))
    .slice(0, 6);
}
