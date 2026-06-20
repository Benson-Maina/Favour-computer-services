import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  subject: z.string().min(3).max(160),
  message: z.string().min(10).max(2000)
});

export const bookingSchema = z.object({
  service: z.string().min(2).max(120),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  preferredDate: z.string().optional(),
  message: z.string().min(10).max(2000)
});

export const productInquirySchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(2).max(180),
  productSlug: z.string().min(2).max(200),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  message: z.string().min(10).max(1000)
});

export const newsletterSchema = z.object({
  email: z.string().email()
});

export const checkoutSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  deliveryMethod: z.enum(["pickup", "delivery", "whatsapp"]),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  items: z.string().min(2),
  paymentReference: z.string().min(3).max(100)
});

export const inventoryAdjustmentSchema = z.object({
  productId: z.string().min(1),
  change: z.coerce.number().int().refine((value) => value !== 0, "Stock change cannot be zero."),
  reason: z.string().min(3).max(240),
  actor: z.string().min(2).max(120).default("Admin")
});

export const orderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["pending_payment", "payment_submitted", "payment_verified", "processing", "ready_for_pickup", "completed", "cancelled", "shipped", "delivered"]),
  note: z.string().max(500).optional(),
  notifyCustomer: z.coerce.boolean().optional()
});

export const paymentReviewSchema = z.object({
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  action: z.enum(["verify", "reject"]),
  rejectionReason: z.string().max(500).optional(),
  actor: z.string().min(2).max(120).default("Admin")
});

export const productAdminSchema = z.object({
  name: z.string().min(2).max(180),
  slug: z.string().min(2).max(200),
  sku: z.string().min(2).max(80),
  brand: z.string().min(2).max(120),
  category: z.string().min(2).max(120),
  description: z.string().min(10).max(4000),
  specifications: z.string().max(4000).optional(),
  images: z.string().max(4000).optional(),
  price: z.coerce.number().nonnegative(),
  costPrice: z.coerce.number().nonnegative().optional(),
  salePrice: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative(),
  featured: z.coerce.boolean().optional(),
  availabilityStatus: z.enum(["active", "draft", "hidden", "archived"]).default("active"),
  productCondition: z.enum(["new", "refurbished", "used"]).default("new"),
  warranty: z.string().max(180).optional(),
  newArrival: z.coerce.boolean().optional(),
  lowStockThreshold: z.coerce.number().int().nonnegative().default(3),
  supplierName: z.string().max(180).optional(),
  supplierContact: z.string().max(180).optional()
});

export const productLifecycleSchema = z.object({
  productId: z.string().min(1),
  action: z.enum(["delete", "archive", "restore", "duplicate"])
});
