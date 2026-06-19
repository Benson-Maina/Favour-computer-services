import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "Laptops Nairobi",
  description: "Buy genuine HP, Dell, Lenovo, Acer, Asus, and Apple laptops in Nairobi with shop pickup and support."
};

export default function LaptopsNairobiPage() {
  return <SeoLandingPage title="Laptops Nairobi" category="Laptops" cta="Shop laptops" description="Find business, student, creative, and performance laptops in Nairobi with clear specifications, stock visibility, warranty guidance, and Paybill checkout." />;
}
