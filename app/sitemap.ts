import type { MetadataRoute } from "next";
import { getBlogPosts, getBusinessSettings, getCategories, getProducts, getServices } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [business, products, categories, services, blogPosts] = await Promise.all([getBusinessSettings(), getProducts(), getCategories(), getServices(), getBlogPosts()]);
  const staticRoutes = ["", "/shop", "/categories", "/services", "/blog", "/about", "/contact", "/laptops-nairobi", "/phones-nairobi", "/ssd-nairobi", "/cctv-installation-nairobi", "/live-streaming-nairobi"].map((path) => ({ url: `${business.siteUrl}${path}`, lastModified: new Date() }));
  return [
    ...staticRoutes,
    ...products.map((item) => ({ url: `${business.siteUrl}/products/${item.slug}`, lastModified: new Date(item.createdAt) })),
    ...categories.map((item) => ({ url: `${business.siteUrl}/categories/${item.slug}`, lastModified: new Date() })),
    ...services.map((item) => ({ url: `${business.siteUrl}/services/${item.slug}`, lastModified: new Date() })),
    ...blogPosts.map((item) => ({ url: `${business.siteUrl}/blog/${item.slug}`, lastModified: new Date(item.publishedAt) }))
  ];
}
