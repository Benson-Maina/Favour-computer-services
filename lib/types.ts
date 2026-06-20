export type InventoryAdjustment = {
  id: string;
  date: string;
  change: number;
  reason: string;
  actor: string;
};

export type InventoryAlert = {
  id: string;
  title: string;
  description: string;
  productId: string;
  severity: "low" | "critical";
  type: "inventory";
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  condition?: "new" | "refurbished" | "used";
  costPrice?: number;
  price: number;
  compareAtPrice?: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  unitsSold?: number;
  stock: number;
  lowStockThreshold: number;
  supplierName: string;
  supplierContact: string;
  warranty?: string;
  status?: "active" | "draft" | "hidden" | "archived";
  reservedStock?: number;
  incomingStock?: number;
  badge?: string;
  images: string[];
  description: string;
  specs: Record<string, string>;
  featured?: boolean;
  newArrival?: boolean;
  bestSelling?: boolean;
  createdAt: string;
  inventoryHistory?: InventoryAdjustment[];
};

export type Category = {
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  image: string;
  publishedAt: string;
  author: string;
  seoTitle?: string;
  seoDescription?: string;
  published?: boolean;
  draft?: boolean;
  scheduledAt?: string;
};

export type Service = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  packages: { name: string; price: string; features: string[] }[];
  faqs: { question: string; answer: string }[];
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  shippingAddress?: string;
  notes?: string;
  paymentReference: string;
  paymentScreenshotUrl?: string;
  itemsSnapshot: OrderItem[];
  status: "pending_payment" | "payment_submitted" | "payment_verified" | "processing" | "ready_for_pickup" | "completed" | "cancelled" | "shipped" | "delivered";
  statusNotes?: string[];
  total: number;
  createdAt: string;
};

export type Payment = {
  id: string;
  orderId: string;
  amount: number;
  paybillNumber: string;
  accountNumber: string;
  transactionCode: string;
  confirmationUrl?: string;
  verified: boolean;
  rejected: boolean;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
};

export type PaymentLog = {
  id: string;
  paymentId: string;
  orderId: string;
  action: "submitted" | "verified" | "rejected";
  note?: string;
  actor: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  service: string;
  name: string;
  email: string;
  phone: string;
  preferredDate?: string;
  message: string;
  status: "new" | "contacted" | "scheduled" | "completed" | "cancelled";
  createdAt: string;
};

export type SearchSuggestion = {
  term: string;
  count: number;
};

export type ChartPoint = {
  name: string;
  revenue?: number;
  orders?: number;
  customers?: number;
  units?: number;
  stock?: number;
};

export type AdminActivity = {
  id: string;
  title: string;
  description: string;
  type: "order" | "inventory" | "booking" | "payment" | "product";
  time: string;
};

export type BusinessOrderStatus = "pending" | "awaiting_payment" | "paid" | "processing" | "ready_for_pickup" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "pending_verification" | "approved" | "rejected";

export type OrderTimelineEvent = {
  id: string;
  orderId: string;
  label: string;
  createdAt: string;
  actor: string;
};

export type Receipt = {
  id: string;
  receiptNumber: string;
  orderId: string;
  customerName: string;
  customerContact: string;
  items: OrderItem[];
  total: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  total: number;
  tax: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type ReturnRequest = {
  id: string;
  orderId: string;
  customerName: string;
  reason: string;
  status: "return_requested" | "under_review" | "approved" | "rejected" | "refunded";
  createdAt: string;
};

export type ShippingRecord = {
  id: string;
  orderId: string;
  courier?: string;
  trackingNumber?: string;
  status: "not_required" | "pending" | "shipped" | "delivered";
};

export type AuditLog = {
  id: string;
  user: string;
  action: string;
  entity: string;
  details: string;
  createdAt: string;
};

export type CustomerSummary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpending: number;
  lastOrderAt: string;
};
