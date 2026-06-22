import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { SocialLinksIcons } from "@/components/social-links";
import { Card, CardContent } from "@/components/ui/card";
import { getBusinessSettings } from "@/lib/data";

export default async function AboutPage() {
  const business = await getBusinessSettings();
  return (
    <section className="container py-12">
      <SectionHeading eyebrow="About" title="Favour Computer Services" description="A Nairobi technology partner for genuine electronics, practical advice, and dependable installation services." />
      <div className="grid gap-6 md:grid-cols-3">
        {["Genuine products with clear warranty details", "Professional CCTV, networking, and streaming support", "Convenient online orders, WhatsApp orders, and shop pickup"].map((item) => (
          <Card key={item}><CardContent className="flex gap-3 p-5"><CheckCircle2 className="size-5 text-primary shrink-0" /><p>{item}</p></CardContent></Card>
        ))}
      </div>
      <Card className="mt-8">
        <CardContent className="space-y-4 p-6 text-muted-foreground">
          <p>We are located at {business.location}. Our goal is to help customers buy the right devices, upgrade existing machines, secure premises with CCTV, and run reliable technology for work, school, church, and business.</p>
          {business.operatingHours ? <p><strong className="text-foreground">Hours:</strong> {business.operatingHours}</p> : null}
          <SocialLinksIcons links={business.socialLinks} />
        </CardContent>
      </Card>
    </section>
  );
}
