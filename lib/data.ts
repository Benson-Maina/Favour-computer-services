import { emptySocialLinks, parseSocialLinks, type SocialLinks } from "@/lib/social-links";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogPost, Booking, Category, Product, Service } from "@/lib/types";

type Row = Record<string, unknown>;

export type BusinessSettings = {
  name: string;
  location: string;
  phone: string;
  whatsapp: string;
  email: string;
  paybill: string;
  account: string;
  tillNumber: string;
  pickupAddress: string;
  operatingHours: string;
  siteUrl: string;
  description: string;
  socialLinks: SocialLinks;
};

export const business: BusinessSettings = {
  name: "Favour Computer Services",
  location: "F&F Building, Next to Odeon Cinema, Shop U13, Nairobi, Kenya",
  phone: "0726548592",
  whatsapp: "254726548592",
  email: "bensonmurage254@gmail.com",
  paybill: "247247",
  account: "FAVOUR-U13",
  tillNumber: "",
  pickupAddress: "F&F Building, Next to Odeon Cinema, Shop U13, Nairobi, Kenya",
  operatingHours: "Mon–Sat: 8:00 AM – 6:00 PM",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://favourcomputerservices.co.ke",
  description: "Quality electronics, CCTV systems, repairs, networking, and live streaming services in Nairobi.",
  socialLinks: emptySocialLinks()
};

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

function logQueryError(label: string, error: { message?: string; code?: string; details?: string | null; hint?: string | null }) {
  console.error(`${label}:`, error.message || error.code || "Unknown database error", {
    code: error.code,
    details: error.details,
    hint: error.hint
  });
}

function settingString(settings: Map<string, unknown>, key: string, fallback: string) {
  const direct = settings.get(key);
  if (typeof direct === "string") return direct;
  const wrapped = objectValue(direct);
  return text(wrapped.value, fallback);
}

function nestedSettingString(settings: Map<string, unknown>, groupKey: string, nestedKey: string, fallback: string) {
  const group = objectValue(settings.get(groupKey));
  return text(group[nestedKey], fallback);
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const supabase = createAdminClient();
  if (!supabase) return business;

  const { data } = await supabase.from("site_settings").select("key,value");
  const settings = new Map((data ?? []).map((row) => [text((row as Row).key), (row as Row).value]));

  const legacyBusiness = "business";
  const legacyPayment = "payment";
  const socialRaw = settings.get("social_links");
  return {
    name: settingString(settings, "business_name", nestedSettingString(settings, legacyBusiness, "name", business.name)),
    location: settingString(settings, "business_location", nestedSettingString(settings, legacyBusiness, "location", business.location)),
    phone: settingString(settings, "business_phone", nestedSettingString(settings, legacyBusiness, "phone", business.phone)),
    whatsapp: settingString(settings, "business_whatsapp", business.whatsapp),
    email: settingString(settings, "business_email", nestedSettingString(settings, legacyBusiness, "email", business.email)),
    paybill: settingString(settings, "paybill_number", nestedSettingString(settings, legacyPayment, "paybill_number", business.paybill)),
    account: settingString(settings, "paybill_account", nestedSettingString(settings, legacyPayment, "account_number", business.account)),
    tillNumber: settingString(settings, "till_number", business.tillNumber),
    pickupAddress: settingString(settings, "pickup_address", settingString(settings, "business_location", business.pickupAddress)),
    operatingHours: settingString(settings, "operating_hours", business.operatingHours),
    siteUrl: settingString(settings, "site_url", business.siteUrl),
    description: settingString(settings, "business_description", business.description),
    socialLinks: parseSocialLinks(socialRaw)
  };
}

export function mapProduct(row: Row): Product {
  const category = objectValue(row.categories);
  const brand = objectValue(row.brands);
  const productImages = arrayValue<Row>(row.product_images);
  const images = productImages.length
    ? productImages.sort((a, b) => numberValue(a.sort_order) - numberValue(b.sort_order)).map((image) => text(image.public_url)).filter(Boolean)
    : arrayValue<string>(row.images);

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
    compareAtPrice: row.compare_at_price == null ? undefined : numberValue(row.compare_at_price),
    salePrice: row.sale_price == null ? undefined : numberValue(row.sale_price),
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
    images,
    description: text(row.description),
    specs: objectValue(row.specs) as Record<string, string>,
    featured: Boolean(row.featured),
    newArrival: Boolean(row.new_arrival),
    bestSelling: Boolean(row.best_selling),
    createdAt: text(row.created_at, new Date().toISOString())
  };
}

export async function getProducts(options: { includeInactive?: boolean; limit?: number } = {}) {
  const supabase = createAdminClient();
  if (!supabase) return [];

  let query = supabase
    .from("products")
    .select("*, categories(name,slug), brands(name,slug), product_images(public_url,sort_order,is_primary)")
    .order("created_at", { ascending: false });

  if (!options.includeInactive) query = query.eq("status", "active");
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) {
    logQueryError("Product query failed", error);
    return [];
  }
  return (data ?? []).map((row) => mapProduct(row as Row));
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts({ includeInactive: false });
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductReviews(productId: string) {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("id,rating,title,body,created_at,users(full_name)")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((row) => {
    const user = objectValue((row as Row).users);
    return {
      id: text((row as Row).id),
      rating: numberValue((row as Row).rating),
      title: text((row as Row).title),
      body: text((row as Row).body),
      author: text(user.full_name, "Customer"),
      createdAt: text((row as Row).created_at)
    };
  });
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from("categories").select("*, children:categories(name)").is("parent_id", null).order("name");
  if (error) {
    logQueryError("Category query failed", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    name: text((row as Row).name),
    slug: text((row as Row).slug),
    description: text((row as Row).description),
    image: text((row as Row).image_url),
    subcategories: arrayValue<Row>((row as Row).children).map((child) => text(child.name)).filter(Boolean)
  }));
}

export async function getTestimonials() {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("testimonials").select("name,role,quote,rating").eq("approved", true).order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((row) => ({ name: text((row as Row).name), role: text((row as Row).role), quote: text((row as Row).quote), rating: numberValue((row as Row).rating, 5) }));
}

export async function getFaqs(category?: string) {
  const supabase = createAdminClient();
  if (!supabase) return [];
  let query = supabase.from("faqs").select("question,answer,category").eq("published", true).order("sort_order");
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []).map((row) => ({ question: text((row as Row).question), answer: text((row as Row).answer), category: text((row as Row).category) }));
}

export async function getBlogPosts(options: { publishedOnly?: boolean; limit?: number } = {}): Promise<BlogPost[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  let query = supabase
    .from("blog_posts")
    .select("*, blog_categories(name,slug)")
    .order("published_at", { ascending: false, nullsFirst: false });
  if (options.publishedOnly ?? true) query = query.eq("published", true).eq("draft", false);
  if (options.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []).map((row) => {
    const category = objectValue((row as Row).blog_categories);
    return {
      slug: text((row as Row).slug),
      title: text((row as Row).title),
      excerpt: text((row as Row).excerpt),
      content: text((row as Row).content),
      category: text(category.name),
      tags: arrayValue<string>((row as Row).tags),
      image: text((row as Row).featured_image),
      publishedAt: text((row as Row).published_at, text((row as Row).created_at)),
      author: business.name,
      seoTitle: text((row as Row).seo_title),
      seoDescription: text((row as Row).seo_description),
      published: Boolean((row as Row).published),
      draft: Boolean((row as Row).draft),
      scheduledAt: text((row as Row).scheduled_at)
    };
  });
}

export async function getBlogPostBySlug(slug: string) {
  const posts = await getBlogPosts({ publishedOnly: true });
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getServices(): Promise<Service[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const [{ data: settingsData }, faqs] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "services").single(),
    getFaqs("services")
  ]);
  const services = Array.isArray(settingsData?.value) ? settingsData.value as Row[] : [];

  return services.map((service) => ({
    slug: text(service.slug),
    title: text(service.title),
    summary: text(service.summary),
    image: text(service.image),
    packages: arrayValue<Row>(service.packages).map((item) => ({
      name: text(item.name),
      price: text(item.price),
      features: arrayValue<string>(item.features)
    })),
    faqs: arrayValue<Row>(service.faqs).map((faq) => ({ question: text(faq.question), answer: text(faq.answer) })).concat(faqs.map((faq) => ({ question: faq.question, answer: faq.answer })))
  })).filter((service) => service.slug && service.title);
}

export async function getBookings(): Promise<Booking[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: text((row as Row).id),
    service: text((row as Row).service),
    name: text((row as Row).name),
    email: text((row as Row).email),
    phone: text((row as Row).phone),
    preferredDate: text((row as Row).preferred_date),
    message: text((row as Row).message),
    status: text((row as Row).status, "new") as Booking["status"],
    createdAt: text((row as Row).created_at)
  }));
}
