import type { AdminActivity, BlogPost, Booking, Category, InventoryAlert, Order, Payment, PaymentLog, Product, Service } from "@/lib/types";

export const business = {
  name: "Favour Computer Services",
  location: "F&F Building, Next to Odeon Cinema, Shop U13, Nairobi, Kenya",
  phone: "0726548592",
  whatsapp: "254726548592",
  email: "bensonmurage254@gmail.com",
  paybill: "247247",
  account: "FAVOUR-U13",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://favourcomputerservices.co.ke"
};

export const categories: Category[] = [];
export const products: Product[] = [];
export const searchSuggestions: { term: string; count: number }[] = [];
export const recentSearches: string[] = [];
export const trendingProducts: string[] = [];
export const inventoryAlerts: InventoryAlert[] = [];
export const orders: Order[] = [];
export const payments: Payment[] = [];
export const paymentLogs: PaymentLog[] = [];
export const bookingsSample: Booking[] = [];
export const adminActivities: AdminActivity[] = [];
export const services: Service[] = [];
export const testimonials: { name: string; role: string; quote: string; rating: number }[] = [];
export const faqs: { question: string; answer: string }[] = [];
export const blogPosts: BlogPost[] = [];
