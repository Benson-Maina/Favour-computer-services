import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Truck, Wrench, Zap } from "lucide-react";
import { submitContact, subscribeNewsletter } from "@/app/actions";
import { ActionForm } from "@/components/action-form-status";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { business, blogPosts, categories, faqs, products, services, testimonials } from "@/lib/data";
import { whatsappUrl } from "@/lib/utils";

export default function HomePage() {
  const featured = products.filter((product) => product.featured);
  const latest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const best = products.filter((product) => product.bestSelling).slice(0, 4);

  return (
    <>
      <section className="premium-gradient overflow-hidden">
        <div className="container grid min-h-[720px] items-center gap-10 py-14 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-8">
            <Badge variant="success">Electronics Shop Nairobi</Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-black tracking-normal md:text-6xl">Your Trusted Technology Partner in Nairobi</h1>
              <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">Quality Laptops, Phones, Desktops, SSDs, CCTV Systems and Professional Technology Services.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="/shop">Shop Now <ArrowRight className="ml-2 size-4" /></Link></Button>
              <Button asChild variant="outline" size="lg"><Link href={whatsappUrl("Hello Favour Computer Services, I want to shop for electronics.")}>WhatsApp Us</Link></Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Fast Delivery", Truck],
                ["Shop Pickup Available", CheckCircle2],
                ["Genuine Products", ShieldCheck],
                ["Professional Installation", Wrench]
              ].map(([label, Icon]) => (
                <div key={String(label)} className="glass rounded-lg p-4 text-sm font-semibold">
                  <Icon className="mb-2 size-5 text-primary" />
                  {String(label)}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="glass relative aspect-[5/4] overflow-hidden rounded-lg">
              <Image priority src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=85" alt="Premium laptop and electronics display" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="absolute -bottom-6 left-6 right-6 rounded-lg bg-slate-950 p-5 text-white shadow-glow">
              <p className="text-sm text-slate-300">Visit us at</p>
              <p className="font-semibold">{business.location}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <SectionHeading eyebrow="Categories" title="Shop by Department" description="Find the right electronics and technology services for work, home, school, and security." />
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}`} className="group relative min-h-56 overflow-hidden rounded-lg">
              <Image src={category.image} alt={category.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-slate-950/10" />
              <div className="absolute bottom-0 p-5 text-white">
                <h3 className="text-xl font-bold">{category.name}</h3>
                <p className="mt-1 text-sm text-slate-200">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="container">
          <SectionHeading eyebrow="Featured" title="Featured Products" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featured.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>

      <section className="container py-16">
        <SectionHeading eyebrow="New Arrivals" title="Latest Products" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{latest.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className="bg-slate-950 py-16 text-white">
        <div className="container">
          <SectionHeading eyebrow="Best Sellers" title="Top Selling Products" description="Popular electronics and upgrades customers keep coming back for." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{best.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>

      <section className="container py-16">
        <SectionHeading eyebrow="Services" title="Professional Technology Services" />
        <div className="grid gap-5 md:grid-cols-4">
          {services.map((service) => (
            <Card key={service.slug} className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-premium">
              <div className="relative aspect-[4/3]"><Image src={service.image} alt={service.title} fill className="object-cover" sizes="25vw" /></div>
              <CardContent className="space-y-3 p-5">
                <Zap className="size-5 text-primary" />
                <h3 className="font-bold">{service.title}</h3>
                <p className="text-sm text-muted-foreground">{service.summary}</p>
                <Button asChild variant="outline" className="w-full"><Link href={`/services/${service.slug}`}>View Service</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="container grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Customers" title="Trusted by Nairobi Customers" />
            <div className="grid gap-4">
              {testimonials.map((item) => (
                <Card key={item.name}><CardContent className="p-5"><p className="text-muted-foreground">"{item.quote}"</p><p className="mt-4 font-semibold">{item.name}</p><p className="text-sm text-muted-foreground">{item.role}</p></CardContent></Card>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="FAQ" title="Common Questions" />
            <div className="grid gap-3">
              {faqs.map((faq) => (
                <Card key={faq.question}><CardContent className="p-5"><h3 className="font-semibold">{faq.question}</h3><p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p></CardContent></Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container grid gap-8 py-16 lg:grid-cols-[0.8fr_1fr]">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold">Get product deals and service tips</h2>
            <p className="mt-2 opacity-90">Subscribe for laptop deals, CCTV advice, SSD upgrade tips, and shop updates.</p>
            <ActionForm action={subscribeNewsletter} buttonLabel="Subscribe" className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Input name="email" type="email" placeholder="Email address" className="bg-white text-slate-950" />
            </ActionForm>
          </CardContent>
        </Card>
        <div>
          <SectionHeading eyebrow="Blog" title="Latest Buying Guides" />
          <div className="grid gap-4 md:grid-cols-3">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg"><Image src={post.image} alt={post.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="33vw" /></div>
                <h3 className="font-semibold group-hover:text-primary">{post.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
