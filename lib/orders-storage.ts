"use client";

import type { CartItem } from "@/lib/cart-context";

export type StoredOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  shippingAddress?: string;
  notes?: string;
  paymentReference: string;
  paymentStatus: "Payment Submitted" | "Payment Verified" | "Rejected";
  status: "Payment Submitted" | "Processing" | "Ready For Pickup" | "Completed" | "Cancelled";
  items: CartItem[];
  total: number;
  createdAt: string;
};

const storageKey = "favour-computer-services-orders";

export function getStoredOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveStoredOrder(order: StoredOrder) {
  const orders = getStoredOrders();
  localStorage.setItem(storageKey, JSON.stringify([order, ...orders.filter((item) => item.id !== order.id)]));
}
