import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "CCTV Installation Nairobi",
  description: "Professional CCTV installation in Nairobi for homes, shops, offices, churches, and schools."
};

export default function CctvInstallationNairobiPage() {
  return <SeoLandingPage title="CCTV Installation Nairobi" serviceSlug="cctv-installation" cta="Book CCTV installation" description="Plan, install, and maintain CCTV systems in Nairobi with camera positioning, recorder setup, mobile viewing, cabling, and after-installation support." />;
}
