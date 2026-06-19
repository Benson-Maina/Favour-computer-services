import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "Live Streaming Nairobi",
  description: "Professional live streaming services in Nairobi for churches, events, schools, and corporate broadcasts."
};

export default function LiveStreamingNairobiPage() {
  return <SeoLandingPage title="Live Streaming Nairobi" serviceSlug="live-streaming" cta="Book live streaming" description="Run clean live streams in Nairobi with camera setup, audio capture, YouTube or Facebook configuration, recording, and operator support." />;
}
