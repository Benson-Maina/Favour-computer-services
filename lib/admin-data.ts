import { createAdminClient } from "@/lib/supabase/admin";
import type { Booking, Order, Payment, PaymentLog, Product } from "@/lib/types";

type Row = Record<string, unknown>;

export function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : Number(value ?? fallback) || fallback;
}

export function arrayValue<T>(value: unknown, fallback: T[] = []) {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function objectValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Row) : {};
}

export function mapProduct(row: Row): Product {
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

export function mapOrder(row: Row): Order {
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

export function mapPayment(row: Row): Payment {
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

export type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export type CategoryRecord = { id: string; name: string; slug: string; productCount: number };
export type BrandRecord = { id: string; name: string; slug: string; productCount: number };

export type AdminUserRecord = {
  id: string;
  email: string | null;
  fullName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export type ReviewRecord = {
  id: string;
  productName: string;
  userName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
};

export type TestimonialRecord = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  approved: boolean;
  createdAt: string;
};

export type ReceiptRecord = {
  id: string;
  receiptNumber: string;
  orderId: string;
  customerName: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
};

export type AuditLogRecord = {
  id: string;
  user: string;
  action: string;
  entity: string;
  details: string;
  createdAt: string;
};

export type OrderTimelineEntry = {
  id: string;
  label: string;
  actorName: string;
  createdAt: string;
};

export type OrderNoteRecord = {
  id: string;
  note: string;
  notifyCustomer: boolean;
  createdAt: string;
};

export type NewsletterRecord = {
  id: string;
  email: string;
  createdAt: string;
};

export type BlogPostRecord = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  draft: boolean;
  scheduledAt: string;
  category: string;
  createdAt: string;
};

const productSelect = "*, categories(name,slug), brands(name,slug), product_images(public_url,sort_order,is_primary)";

export async function loadProducts() {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("products").select(productSelect).order("created_at", { ascending: false });
  return (data ?? []).map((row) => mapProduct(row as Row));
}

export async function loadProductById(id: string) {
  const supabase = createAdminClient();
  if (!supabase) return null;
  const { data } = await supabase.from("products").select(productSelect).eq("id", id).maybeSingle();
  return data ? mapProduct(data as Row) : null;
}

export async function loadCategoriesWithCounts(): Promise<CategoryRecord[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id,name,slug").order("name"),
    supabase.from("products").select("category_id")
  ]);
  const counts = new Map<string, number>();
  (products ?? []).forEach((p) => {
    const id = text((p as Row).category_id);
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  });
  return (categories ?? []).map((row) => ({
    id: text((row as Row).id),
    name: text((row as Row).name),
    slug: text((row as Row).slug),
    productCount: counts.get(text((row as Row).id)) ?? 0
  }));
}

export async function loadBrandsWithCounts(): Promise<BrandRecord[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const [{ data: brands }, { data: products }] = await Promise.all([
    supabase.from("brands").select("id,name,slug").order("name"),
    supabase.from("products").select("brand_id")
  ]);
  const counts = new Map<string, number>();
  (products ?? []).forEach((p) => {
    const id = text((p as Row).brand_id);
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  });
  return (brands ?? []).map((row) => ({
    id: text((row as Row).id),
    name: text((row as Row).name),
    slug: text((row as Row).slug),
    productCount: counts.get(text((row as Row).id)) ?? 0
  }));
}

export async function loadCategoryBrandOptions() {
  const [categories, brands] = await Promise.all([loadCategoriesWithCounts(), loadBrandsWithCounts()]);
  return { categories, brands };
}

export async function loadOrders() {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((row) => mapOrder(row as Row));
}

export async function loadOrderById(id: string) {
  const supabase = createAdminClient();
  if (!supabase) return null;
  const { data } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  return data ? mapOrder(data as Row) : null;
}

export async function loadOrderTimeline(orderId: string): Promise<OrderTimelineEntry[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("order_timeline").select("*").eq("order_id", orderId).order("created_at", { ascending: true });
  return (data ?? []).map((row) => ({
    id: text((row as Row).id),
    label: text((row as Row).label),
    actorName: text((row as Row).actor_name, "Admin"),
    createdAt: text((row as Row).created_at, new Date().toISOString())
  }));
}

export async function loadOrderNotes(orderId: string): Promise<OrderNoteRecord[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("order_notes").select("*").eq("order_id", orderId).order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: text((row as Row).id),
    note: text((row as Row).note),
    notifyCustomer: Boolean((row as Row).notify_customer),
    createdAt: text((row as Row).created_at, new Date().toISOString())
  }));
}

export async function loadPaymentForOrder(orderId: string) {
  const supabase = createAdminClient();
  if (!supabase) return null;
  const { data } = await supabase.from("payments").select("*").eq("order_id", orderId).maybeSingle();
  return data ? mapPayment(data as Row) : null;
}

export async function loadPayments() {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((row) => mapPayment(row as Row));
}

export async function loadPaymentLogs(): Promise<PaymentLog[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("payment_logs").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: text((row as Row).id),
    paymentId: text((row as Row).payment_id),
    orderId: text((row as Row).order_id),
    action: text((row as Row).action, "submitted") as PaymentLog["action"],
    note: text((row as Row).note),
    actor: text((row as Row).actor_name, "Admin"),
    createdAt: text((row as Row).created_at, new Date().toISOString())
  }));
}

export async function loadBookings(serviceFilter?: "cctv" | "live-streaming"): Promise<Booking[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
  return (data ?? [])
    .map((row) => ({
      id: text((row as Row).id),
      service: text((row as Row).service),
      name: text((row as Row).name),
      email: text((row as Row).email),
      phone: text((row as Row).phone),
      preferredDate: text((row as Row).preferred_date),
      message: text((row as Row).message),
      status: text((row as Row).status, "new") as Booking["status"],
      createdAt: text((row as Row).created_at, new Date().toISOString())
    }))
    .filter((booking) => {
      if (!serviceFilter) return true;
      const service = booking.service.toLowerCase();
      if (serviceFilter === "cctv") return service.includes("cctv");
      return service.includes("live") || service.includes("stream");
    });
}

export async function loadContactInquiries(): Promise<ContactInquiry[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("contact_inquiries").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: text((row as Row).id),
    name: text((row as Row).name),
    email: text((row as Row).email),
    phone: text((row as Row).phone),
    subject: text((row as Row).subject),
    message: text((row as Row).message),
    status: text((row as Row).status, "new"),
    createdAt: text((row as Row).created_at, new Date().toISOString())
  }));
}

export async function loadUsers(): Promise<AdminUserRecord[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("users").select("id,email,full_name,phone,role,is_active,created_at").order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: text((row as Row).id),
    email: text((row as Row).email) || null,
    fullName: text((row as Row).full_name, "Customer"),
    phone: text((row as Row).phone) || null,
    role: text((row as Row).role, "customer"),
    isActive: (row as Row).is_active !== false,
    createdAt: text((row as Row).created_at, new Date().toISOString())
  }));
}

export async function loadReviews(): Promise<ReviewRecord[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("reviews").select("id,rating,body,approved,created_at,user_id,products(name),users(full_name)").order("created_at", { ascending: false });
  return (data ?? []).map((row) => {
    const products = objectValue((row as Row).products);
    const users = objectValue((row as Row).users);
    return {
      id: text((row as Row).id),
      productName: text(products.name, "Unknown product"),
      userName: text(users.full_name, "Customer"),
      rating: numberValue((row as Row).rating),
      comment: text((row as Row).body),
      approved: Boolean((row as Row).approved),
      createdAt: text((row as Row).created_at, new Date().toISOString())
    };
  });
}

export async function loadTestimonials(): Promise<TestimonialRecord[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: text((row as Row).id),
    name: text((row as Row).name),
    role: text((row as Row).role),
    quote: text((row as Row).quote),
    rating: numberValue((row as Row).rating),
    approved: Boolean((row as Row).approved),
    createdAt: text((row as Row).created_at, new Date().toISOString())
  }));
}

export async function loadReceipts(): Promise<ReceiptRecord[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("receipts").select("*, orders(payment_status)").order("created_at", { ascending: false });
  return (data ?? []).map((row) => {
    const order = objectValue((row as Row).orders);
    return {
      id: text((row as Row).id),
      receiptNumber: text((row as Row).receipt_number),
      orderId: text((row as Row).order_id),
      customerName: text((row as Row).customer_name),
      total: numberValue((row as Row).total),
      paymentStatus: text(order.payment_status, "approved"),
      createdAt: text((row as Row).created_at, new Date().toISOString())
    };
  });
}

export async function loadAuditLogs(): Promise<AuditLogRecord[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
  return (data ?? []).map((row) => ({
    id: text((row as Row).id),
    user: text((row as Row).user_name, "System"),
    action: text((row as Row).action),
    entity: text((row as Row).entity),
    details: text((row as Row).details),
    createdAt: text((row as Row).created_at, new Date().toISOString())
  }));
}

export async function loadNewsletterSubscribers(): Promise<NewsletterRecord[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: text((row as Row).id),
    email: text((row as Row).email),
    createdAt: text((row as Row).created_at, new Date().toISOString())
  }));
}

export async function loadBlogPosts(): Promise<BlogPostRecord[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("blog_posts").select("id,title,slug,published,draft,scheduled_at,created_at,blog_categories(name)").order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: text((row as Row).id),
    title: text((row as Row).title),
    slug: text((row as Row).slug),
    published: Boolean((row as Row).published),
    draft: Boolean((row as Row).draft),
    scheduledAt: text((row as Row).scheduled_at),
    category: text(objectValue((row as Row).blog_categories).name),
    createdAt: text((row as Row).created_at, new Date().toISOString())
  }));
}

export type DashboardMetrics = {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  inventoryAlerts: number;
  newInquiries: number;
  newBookings: number;
};

export async function loadDashboardMetrics(): Promise<DashboardMetrics> {
  const [products, orders, inquiries, bookings] = await Promise.all([
    loadProducts(),
    loadOrders(),
    loadContactInquiries(),
    loadBookings()
  ]);
  const completedOrders = orders.filter((o) => ["payment_verified", "completed", "delivered"].includes(o.status));
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  return {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: completedOrders.reduce((sum, o) => sum + o.total, 0),
    inventoryAlerts: lowStock + outOfStock,
    newInquiries: inquiries.filter((i) => i.status === "new").length,
    newBookings: bookings.filter((b) => b.status === "new").length
  };
}

export function getOrderPaymentStatus(order: Order, payments: Payment[]) {
  const payment = payments.find((p) => p.orderId === order.id);
  if (payment?.verified) return "Paid";
  if (payment?.rejected) return "Rejected";
  if (order.status === "pending_payment") return "Pending";
  if (order.status === "payment_submitted") return "Submitted";
  if (["payment_verified", "processing", "ready_for_pickup", "completed", "delivered", "shipped"].includes(order.status)) return "Paid";
  if (order.status === "cancelled") return "Cancelled";
  return "Pending";
}

export function getInventoryStatus(product: Product) {
  if (product.stock === 0) return "out_of_stock" as const;
  if (product.stock <= product.lowStockThreshold) return "low_stock" as const;
  return "healthy" as const;
}
