import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getServices } from "@/lib/data";

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <section className="container py-12">
      <SectionHeading eyebrow="Services" title="Technology Services in Nairobi" description="Professional CCTV installation, live streaming, computer repair, and networking services." />
      <div className="grid gap-6 md:grid-cols-2">
        {services.length ? services.map((service) => (
          <Card key={service.slug} className="overflow-hidden">
            <div className="relative aspect-[16/9] bg-secondary">{service.image ? <Image src={service.image} alt={service.title} fill className="object-cover" sizes="50vw" /> : null}</div>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-2xl font-bold">{service.title}</h2>
              <p className="text-muted-foreground">{service.summary}</p>
              <Button asChild><Link href={`/services/${service.slug}`}>View Packages</Link></Button>
            </CardContent>
          </Card>
        )) : <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground md:col-span-2">No services published yet.</div>}
      </div>
    </section>
  );
}
