import { Mail, MapPin, Phone } from "lucide-react";
import { submitContact } from "@/app/actions";
import { ActionForm } from "@/components/action-form-status";
import { SocialLinksIcons } from "@/components/social-links";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getBusinessSettings } from "@/lib/data";

export default async function ContactPage() {
  const business = await getBusinessSettings();
  return (
    <section className="container grid gap-8 py-12 lg:grid-cols-[0.8fr_1fr]">
      <div className="space-y-5">
        <h1 className="text-4xl font-black">Contact Favour Computer Services</h1>
        <p className="text-muted-foreground">Visit our Nairobi shop, call, WhatsApp, or send a message for product and service inquiries.</p>
        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="flex gap-2"><MapPin className="size-5 text-primary shrink-0" /> {business.location}</p>
            {business.pickupAddress && business.pickupAddress !== business.location ? (
              <p className="flex gap-2 text-sm text-muted-foreground"><MapPin className="size-4 shrink-0" /> Pickup: {business.pickupAddress}</p>
            ) : null}
            <p className="flex gap-2"><Phone className="size-5 text-primary shrink-0" /> {business.phone}</p>
            <p className="flex gap-2"><Mail className="size-5 text-primary shrink-0" /> {business.email}</p>
            {business.operatingHours ? <p className="text-sm text-muted-foreground">{business.operatingHours}</p> : null}
            <SocialLinksIcons links={business.socialLinks} className="pt-2" />
          </CardContent>
        </Card>
        <div className="aspect-[16/10] overflow-hidden rounded-lg border bg-secondary">
          <iframe title="Favour Computer Services map" src="https://www.google.com/maps?q=Odeon%20Cinema%20Nairobi&output=embed" className="size-full" loading="lazy" />
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-2xl font-bold">Send Message</h2>
          <ActionForm action={submitContact} buttonLabel="Send Inquiry">
            <label className="grid gap-2 text-sm font-medium">Name<Input name="name" placeholder="Your full name" required minLength={2} /></label>
            <label className="grid gap-2 text-sm font-medium">Email<Input name="email" type="email" placeholder="you@example.com" required /></label>
            <label className="grid gap-2 text-sm font-medium">Phone<Input name="phone" placeholder="0726548592" required minLength={7} /></label>
            <label className="grid gap-2 text-sm font-medium">Subject<Input name="subject" placeholder="How can we help?" required minLength={3} /></label>
            <label className="grid gap-2 text-sm font-medium">Message<Textarea name="message" placeholder="Tell us what you need" required minLength={10} /></label>
          </ActionForm>
        </CardContent>
      </Card>
    </section>
  );
}
