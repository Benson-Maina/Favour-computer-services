import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "SSD Nairobi",
  description: "Buy SSD drives and get laptop or desktop SSD upgrade support in Nairobi."
};

export default function SsdNairobiPage() {
  return <SeoLandingPage title="SSD Nairobi" category="SSD" cta="Shop SSDs" description="Upgrade your laptop or desktop with fast SSD storage in Nairobi. Shop NVMe and SATA drives with installation support available in-store." />;
}
