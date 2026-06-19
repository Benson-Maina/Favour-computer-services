import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "Phones Nairobi",
  description: "Shop original smartphones in Nairobi from Samsung, Apple, Xiaomi, Oppo, Tecno, and Infinix."
};

export default function PhonesNairobiPage() {
  return <SeoLandingPage title="Phones Nairobi" category="Phones" cta="Shop phones" description="Buy original smartphones in Nairobi with reliable support, transparent pricing, Paybill checkout, and convenient pickup from the CBD." />;
}
