import type { MetadataRoute } from "next";
import { getBusinessSettings } from "@/lib/data";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const business = await getBusinessSettings();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin"] },
    sitemap: `${business.siteUrl}/sitemap.xml`
  };
}
