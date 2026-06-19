import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { requirePermission } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminActivity, Booking, ChartPoint, InventoryAlert, Order, Payment, PaymentLog, Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Operations dashboard for Favour Computer Services inventory, orders, payments, bookings, content, and analytics."
};

type Row = Record<string, unknown>;

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : Number(value ?? fallback) || fallback;
}

function arrayValue<T>(value: unknown, fallback: T[] = []) {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function mapProduct(row: Row): Product {
  return {
    id: text(row.id),
    slug: text(row.slug),
    sku: text(row.sku),
    name: text(row.name),
    brand: text(row.brand_name, "Unassigned"),
    category: text(row.category_name, "Unassigned"),
    subcategory: text(row.category_name, "Unassigned"),
    condition: text(row.condition, "new") as Product["condition"],
    costPrice: numberValue(row.cost_price),
    price: numberValue(row.price),
    salePrice: row.sale_price == null ? undefined : numberValue(row.sale_price),
    compareAtPrice: row.compare_at_price == null ? undefined : numberValue(row.compare_at_price),
    rating: numberValue(row.rating),
    reviewCount: numberValue(row.review_count),
    stock: numberValue(row.stock),
    reservedStock: numberValue(row.reserved_stock),
    incomingStock: numberValue(row.incoming_stock),
    lowStockThreshold: numberValue(row.low_stock_threshold, 3),
    supplierName: text(row.supplier_name),
    supplierContact: text(row.supplier_contact),
    warranty: text(row.warranty),
    status: text(row.status, "active") as Product["status"],
    images: arrayValue<string>(row.images),
    description: text(row.description),
    specs: (row.specs && typeof row.specs === "object" ? row.specs : {}) as Record<string, string>,
    featured: Boolean(row.featured),
    newArrival: Boolean(row.new_arrival),
    bestSelling: Boolean(row.best_selling),
    createdAt: text(row.created_at, new Date().toISOString())
  };
}

function mapOrder(row: Row): Order {
  return {
    id: text(row.id),
    customerName: text(row.customer_name),
    customerEmail: text(row.customer_email),
    customerPhone: text(row.customer_phone),
    deliveryMethod: text(row.delivery_method),
    shippingAddress: text(row.shipping_address),
    notes: text(row.notes),
    paymentReference: text(row.payment_reference),
    paymentScreenshotUrl: text(row.payment_screenshot_url),
    itemsSnapshot: arrayValue(row.items_snapshot),
    status: text(row.status, "pending_payment") as Order["status"],
    total: numberValue(row.total),
    createdAt: text(row.created_at, new Date().toISOString())
  };
}

function mapPayment(row: Row): Payment {
  return {
    id: text(row.id),
    orderId: text(row.order_id),
    amount: numberValue(row.amount),
    paybillNumber: text(row.paybill_number),
    accountNumber: text(row.account_number),
    transactionCode: text(row.transaction_code),
    confirmationUrl: text(row.confirmation_url),
    verified: Boolean(row.verified),
    rejected: Boolean(row.rejected),
    rejectionReason: text(row.rejection_reason),
    verifiedAt: text(row.verified_at),
    createdAt: text(row.created_at, new Date().toISOString())
  };
}

function chartFromOrders(orders: Order[]): ChartPoint[] {
  const grouped = new Map<string, { revenue: number; orders: number }>();
  orders.forEach((order) => {
    const name = new Date(order.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" });
    const current = grouped.get(name) ?? { revenue: 0, orders: 0 };
    grouped.set(name, { revenue: current.revenue + order.total, orders: current.orders + 1 });
  });
  return Array.from(grouped, ([name, value]) => ({ name, ...value }));
}

async function loadDashboardData() {
  const supabase = createAdminClient();
  if (!supabase) {
    return { products: [], orders: [], payments: [], paymentLogs: [], bookings: [], activities: [] };
  }

  const [productsResult, ordersResult, paymentsResult, paymentLogsResult, bookingsResult, auditResult] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("payments").select("*").order("created_at", { ascending: false }),
    supabase.from("payment_logs").select("*").order("created_at", { ascending: false }),
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(10)
  ]);

  const products = (productsResult.data ?? []).map((row) => mapProduct(row as Row));
  const orders = (ordersResult.data ?? []).map((row) => mapOrder(row as Row));
  const payments = (paymentsResult.data ?? []).map((row) => mapPayment(row as Row));
  const paymentLogs: PaymentLog[] = (paymentLogsResult.data ?? []).map((row) => ({
    id: text((row as Row).id),
    paymentId: text((row as Row).payment_id),
    orderId: text((row as Row).order_id),
    action: text((row as Row).action, "submitted") as PaymentLog["action"],
    note: text((row as Row).note),
    actor: text((row as Row).actor_name, "Admin"),
    createdAt: text((row as Row).created_at, new Date().toISOString())
  }));
  const bookings: Booking[] = (bookingsResult.data ?? []).map((row) => ({
    id: text((row as Row).id),
    service: text((row as Row).service),
    name: text((row as Row).name),
    email: text((row as Row).email),
    phone: text((row as Row).phone),
    preferredDate: text((row as Row).preferred_date),
    message: text((row as Row).message),
    status: text((row as Row).status, "new") as Booking["status"],
    createdAt: text((row as Row).created_at, new Date().toISOString())
  }));
  const activities: AdminActivity[] = (auditResult.data ?? []).map((row) => ({
    id: text((row as Row).id),
    title: text((row as Row).action),
    description: text((row as Row).details),
    type: "product",
    time: new Date(text((row as Row).created_at, new Date().toISOString())).toLocaleString()
  }));

  return { products, orders, payments, paymentLogs, bookings, activities };
}

export default async function AdminPage() {
  await requirePermission("dashboard:read");
  const { products, orders, payments, paymentLogs, bookings, activities } = await loadDashboardData();
  const completedOrders = orders.filter((order) => ["payment_verified", "completed"].includes(order.status));
  const pendingOrders = orders.filter((order) => ["pending_payment", "payment_submitted"].includes(order.status));
  const revenueChart = chartFromOrders(completedOrders);
  const ordersChart = chartFromOrders(orders);
  const productPerformanceChart = products.map((product) => ({ name: product.name, units: product.unitsSold ?? 0, stock: product.stock })).slice(0, 8);
  const inventoryAlerts: InventoryAlert[] = products
    .filter((product) => product.stock <= product.lowStockThreshold)
    .map((product) => ({
      id: `alert-${product.id}`,
      title: `${product.name} stock alert`,
      description: product.stock === 0 ? "Out of stock." : `${product.stock} units remaining.`,
      productId: product.id,
      severity: product.stock === 0 ? "critical" : "low",
      type: "inventory"
    }));

  return (
    <AdminDashboard
      metrics={{
        totalOrders: orders.length,
        totalRevenue: completedOrders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: pendingOrders.length,
        processingOrders: orders.filter((order) => order.status === "processing").length,
        deliveredOrders: orders.filter((order) => order.status === "completed").length,
        cancelledOrders: orders.filter((order) => order.status === "cancelled").length,
        completedOrders: completedOrders.length,
        totalCustomers: new Set(orders.map((order) => order.customerEmail)).size,
        totalProducts: products.length,
        submittedPayments: payments.filter((payment) => !payment.verified && !payment.rejected).length,
        lowStockProducts: products.filter((product) => product.stock > 0 && product.stock <= product.lowStockThreshold).length,
        outOfStockProducts: products.filter((product) => product.stock === 0).length
      }}
      revenueChart={revenueChart}
      ordersChart={ordersChart}
      customerGrowthChart={ordersChart}
      productPerformanceChart={productPerformanceChart}
      products={products}
      orders={orders}
      payments={payments}
      paymentLogs={paymentLogs}
      bookings={bookings}
      inventoryAlerts={inventoryAlerts}
      activities={activities}
    />
  );
}
