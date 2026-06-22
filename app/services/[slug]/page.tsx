import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { submitBooking } from "@/app/actions";
import { ActionForm } from "@/components/action-form-status";
import { SocialLinksIcons } from "@/components/social-links";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getBusinessSettings, getServices } from "@/lib/data";
import { whatsappUrl } from "@/lib/utils";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [services, business] = await Promise.all([getServices(), getBusinessSettings()]);
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();

  return (
    <section>
      <div className="relative min-h-[420px]">
        {service.image ? <Image priority src={service.image} alt={service.title} fill className="object-cover" sizes="100vw" /> : null}
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="container relative flex min-h-[420px] flex-col justify-end pb-12 text-white">
          <p className="mb-2 text-sm font-bold uppercase text-cyan-300">Professional Service</p>
          <h1 className="max-w-3xl text-4xl font-black md:text-6xl">{service.title}</h1>
          <p className="mt-4 max-w-2xl text-slate-200">{service.summary}</p>
        </div>
      </div>
      <div className="container grid gap-10 py-12 lg:grid-cols-[1fr_420px]">
        <div className="space-y-10">
          <div className="grid gap-5 md:grid-cols-3">
            {service.packages.map((item) => (
              <Card key={item.name}>
                <CardContent className="p-5">
                  <h2 className="font-bold">{item.name}</h2>
                  <p className="mt-2 text-lg font-black text-primary">{item.price}</p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {item.features.map((feature) => <li key={feature}>• {feature}</li>)}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold">Gallery</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {service.image ? [service.image].map((image, index) => <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-lg"><Image src={image} alt={`${service.title} gallery ${index + 1}`} fill className="object-cover" sizes="33vw" /></div>) : null}
            </div>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold">FAQs</h2>
            <div className="grid gap-3">
              {service.faqs.map((faq) => <Card key={faq.question}><CardContent className="p-5"><h3 className="font-semibold">{faq.question}</h3><p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p></CardContent></Card>)}
            </div>
          </div>
        </div>
        <Card className="h-fit">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-bold">Request Consultation</h2>
            <ActionForm action={submitBooking} buttonLabel="Submit Booking Request">
              <input type="hidden" name="service" value={service.title} />
              <Input name="name" placeholder="Full name" required />
              <Input name="email" type="email" placeholder="Email" required />
              <Input name="phone" placeholder="Phone" required />
              <Input name="preferredDate" type="date" />
              <Textarea name="message" placeholder="Tell us what you need" required />
            </ActionForm>
            <Button asChild variant="outline" className="mt-3 w-full"><Link href={whatsappUrl(`Hello Favour Computer Services, I need ${service.title}.`)}><MessageCircle className="mr-2 size-4" /> WhatsApp Service Inquiry</Link></Button>
            <div className="mt-4 flex justify-center">
              <SocialLinksIcons links={business.socialLinks} />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
