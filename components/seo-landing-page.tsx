import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { business, products, services } from "@/lib/data";

type SeoLandingPageProps = {
  title: string;
  description: string;
  category?: string;
  serviceSlug?: string;
  cta: string;
};

export function SeoLandingPage({ title, description, category, serviceSlug, cta }: SeoLandingPageProps) {
  const pageProducts = category ? products.filter((product) => product.category.toLowerCase() === category.toLowerCase() || product.subcategory.toLowerCase() === category.toLowerCase()).slice(0, 6) : [];
  const service = serviceSlug ? services.find((item) => item.slug === serviceSlug) : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": service ? "Service" : "CollectionPage",
    name: title,
    description,
    provider: {
      "@type": "LocalBusiness",
      name: business.name,
      telephone: business.phone,
      address: business.location
    }
  };

  return (
    <section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="border-b bg-secondary/40">
        <div className="container flex items-center gap-2 py-3 text-sm text-muted-foreground">
          <Link href="/">Home</Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground">{title}</span>
        </div>
      </div>
      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Nairobi electronics and services</p>
            <h1 className="mt-2 max-w-4xl text-4xl font-black tracking-tight md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild><Link href={service ? `/services/${service.slug}` : "/shop"}>{cta}</Link></Button>
              <Button asChild variant="outline"><Link href="/contact">Talk to us</Link></Button>
            </div>
          </div>
          <div className="rounded-md border bg-background p-5">
            <p className="font-bold">{business.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{business.location}</p>
            <p className="mt-3 text-sm">Paybill: <strong>{business.paybill}</strong><br />Account: <strong>{business.account}</strong></p>
          </div>
        </div>

        {service ? (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {service.packages.map((item) => (
              <div key={item.name} className="rounded-md border p-5">
                <p className="font-bold">{item.name}</p>
                <p className="mt-1 text-primary">{item.price}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {item.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        {pageProducts.length ? (
          <div className="mt-10">
            <h2 className="text-2xl font-black">Available now</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pageProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
