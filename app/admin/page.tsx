import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import type { AdminUserRecord } from "@/components/admin-user-management";
import { getAdminPermissions, getCurrentAdminRole, requireAdminPage } from "@/lib/admin-auth";
import { getCurrentUserId } from "@/lib/auth";
import { orderStatusLabels, orderStatuses } from "@/lib/admin-analytics";
import { getBusinessSettings } from "@/lib/data";
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

function objectValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Row) : {};
}

function mapProduct(row: Row): Product {
  const category = objectValue(row.categories);
  const brand = objectValue(row.brands);
  const productImages = arrayValue<Row>(row.product_images);
  return {
    id: text(row.id),
    slug: text(row.slug),
    sku: text(row.sku),
    name: text(row.name),
    brand: text(brand.name, "Unassigned"),
    category: text(category.name, "Unassigned"),
    subcategory: text(category.name, "Unassigned"),
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
    images: productImages.length ? productImages.map((image) => text(image.public_url)).filter(Boolean) : arrayValue<string>(row.images),
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
    return { products: [], orders: [], payments: [], paymentLogs: [], bookings: [], activities: [], users: [], orderItems: [], blogPosts: [], contactInquiries: [] };
  }

  const [productsResult, ordersResult, paymentsResult, paymentLogsResult, bookingsResult, auditResult, usersResult, orderItemsResult, blogPostsResult, inquiriesResult] = await Promise.all([
    supabase.from("products").select("*, categories(name,slug), brands(name,slug), product_images(public_url,sort_order,is_primary)").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("payments").select("*").order("created_at", { ascending: false }),
    supabase.from("payment_logs").select("*").order("created_at", { ascending: false }),
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("users").select("id,email,full_name,phone,role,is_active,created_at").order("created_at", { ascending: false }),
    supabase.from("order_items").select("quantity, products(name)").limit(1000),
    supabase.from("blog_posts").select("id,title,published,draft,scheduled_at,blog_categories(name)").order("created_at", { ascending: false }).limit(6),
    supabase.from("contact_inquiries").select("*").order("created_at", { ascending: false }).limit(20)
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

  return {
    products,
    orders,
    payments,
    paymentLogs,
    bookings,
    activities,
    users: usersResult.data ?? [],
    orderItems: orderItemsResult.data ?? [],
    blogPosts: blogPostsResult.data ?? [],
    contactInquiries: (inquiriesResult.data ?? []).map((row) => ({
      id: text((row as Row).id),
      name: text((row as Row).name),
      email: text((row as Row).email),
      phone: text((row as Row).phone),
      subject: text((row as Row).subject),
      message: text((row as Row).message),
      status: text((row as Row).status, "new"),
      createdAt: text((row as Row).created_at, new Date().toISOString())
    }))
  };
}

export default async function AdminPage() {
  await requireAdminPage("dashboard:read");
  const [adminRole, permissions, currentUserId] = await Promise.all([
    getCurrentAdminRole(),
    getAdminPermissions(),
    getCurrentUserId()
  ]);
  if (!adminRole || !currentUserId) return null;

  const [{ products, orders, payments, paymentLogs, bookings, activities, users, orderItems, blogPosts, contactInquiries }, business] = await Promise.all([
    loadDashboardData(),
    getBusinessSettings()
  ]);
  const completedOrders = orders.filter((order) => ["payment_verified", "completed"].includes(order.status));
  const pendingOrders = orders.filter((order) => ["pending_payment", "payment_submitted"].includes(order.status));
  const revenueChart = chartFromOrders(completedOrders);
  const ordersChart = orderStatuses.map((status) => ({ name: orderStatusLabels[status], orders: orders.filter((order) => order.status === status).length }));
  const customerGrowthChart = (users as Row[])
    .filter((user) => text(user.role, "customer") === "customer")
    .reverse()
    .map((user, index) => ({
    name: new Date(text(user.created_at, new Date().toISOString())).toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
    customers: index + 1
  }));
  const adminUsers: AdminUserRecord[] = (users as Row[]).map((user) => ({
    id: text(user.id),
    email: text(user.email) || null,
    fullName: text(user.full_name, "Customer"),
    phone: text(user.phone) || null,
    role: text(user.role, "customer") as AdminUserRecord["role"],
    isActive: user.is_active !== false,
    createdAt: text(user.created_at, new Date().toISOString())
  }));
  const productUnits = new Map<string, number>();
  orderItems.forEach((row) => {
    const rowProducts = (row as Row).products;
    const product = Array.isArray(rowProducts)
      ? (rowProducts as Row[])[0]
      : objectValue(rowProducts);
    const name = text(product?.name);
    if (name) productUnits.set(name, (productUnits.get(name) ?? 0) + numberValue((row as Row).quantity));
  });
  const productPerformanceChart = Array.from(productUnits, ([name, units]) => ({ name, units, stock: products.find((product) => product.name === name)?.stock ?? 0 })).sort((a, b) => b.units - a.units).slice(0, 8);
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
        totalCustomers: (users as Row[]).filter((user) => text(user.role, "customer") === "customer").length,
        totalProducts: products.length,
        submittedPayments: payments.filter((payment) => !payment.verified && !payment.rejected).length,
        lowStockProducts: products.filter((product) => product.stock > 0 && product.stock <= product.lowStockThreshold).length,
        outOfStockProducts: products.filter((product) => product.stock === 0).length
      }}
      revenueChart={revenueChart}
      ordersChart={ordersChart}
      customerGrowthChart={customerGrowthChart}
      productPerformanceChart={productPerformanceChart}
      products={products}
      orders={orders}
      payments={payments}
      paymentLogs={paymentLogs}
      bookings={bookings}
      inventoryAlerts={inventoryAlerts}
      activities={activities}
      blogPosts={blogPosts.map((row) => ({
        id: text((row as Row).id),
        title: text((row as Row).title),
        published: Boolean((row as Row).published),
        draft: Boolean((row as Row).draft),
        scheduledAt: text((row as Row).scheduled_at),
        category: text(objectValue((row as Row).blog_categories).name)
      }))}
      contactInquiries={contactInquiries}
      business={business}
      permissions={permissions}
      adminRole={adminRole}
      adminUsers={adminUsers}
      currentUserId={currentUserId}
    />
  );
}
