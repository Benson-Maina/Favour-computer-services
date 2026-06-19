import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Star, Zap } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBusinessSettings, getProductBySlug, getProductReviews, getProducts } from "@/lib/data";
import { formatCurrency, whatsappUrl } from "@/lib/utils";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [business, product] = await Promise.all([getBusinessSettings(), getProductBySlug(slug)]);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `${business.siteUrl}/products/${product.slug}` },
    openGraph: { title: product.name, description: product.description, images: product.images }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [business, product, products] = await Promise.all([getBusinessSettings(), getProductBySlug(slug), getProducts()]);
  if (!product) notFound();
  const reviews = await getProductReviews(product.id);
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  const images = product.images.filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${business.siteUrl}/products/${product.slug}`
    },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount }
  };

  return (
    <section className="container py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / {product.name}
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-secondary">
            {images[0] ? <Image priority src={images[0]} alt={product.name} fill className="object-cover transition-transform duration-300 hover:scale-110" sizes="(max-width: 1024px) 100vw, 50vw" /> : null}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {images.slice(0, 4).map((image, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-md border"><Image src={image} alt={`${product.name} view ${index + 1}`} fill className="object-cover" sizes="15vw" /></div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            {product.badge ? <Badge>{product.badge}</Badge> : null}
            <h1 className="mt-4 text-3xl font-black tracking-normal md:text-5xl">{product.name}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-500">
              <Star className="size-4 fill-current" /> {product.rating} <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>
          </div>
          <p className="text-muted-foreground">{product.description}</p>
          <div>
            <p className="text-3xl font-black">{formatCurrency(product.price)}</p>
            {product.compareAtPrice ? <p className="text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</p> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card><CardContent className="p-4 text-sm"><strong>Availability</strong><br />{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</CardContent></Card>
            <Card><CardContent className="p-4 text-sm"><strong>Pickup</strong><br />Shop U13 Nairobi</CardContent></Card>
            <Card><CardContent className="p-4 text-sm"><strong>Payment</strong><br />Paybill instructions</CardContent></Card>
          </div>
          <div className="flex flex-wrap gap-3">
            <AddToCartButton product={product} size="lg" />
            <AddToCartButton product={product} size="lg" buyNow className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
            <Button asChild variant="outline" size="lg"><Link href={whatsappUrl(`Hello Favour Computer Services, I am interested in this product: ${product.name}.`)}><MessageCircle className="mr-2 size-4" /> WhatsApp Inquiry</Link></Button>
          </div>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 font-bold">Specifications</h2>
              <div className="grid gap-3">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-4 border-b pb-2 text-sm"><span className="font-medium">{key}</span><span className="text-muted-foreground">{value}</span></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <section className="mt-16">
        <h2 className="mb-5 flex items-center text-2xl font-bold"><Zap className="mr-2 size-5 text-primary" /> Related Products</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div>
      </section>
      <section className="mt-16">
        <h2 className="mb-5 text-2xl font-bold">Customer Reviews</h2>
        <div className="grid gap-4">
          {reviews.length ? reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-sm text-amber-500"><Star className="size-4 fill-current" /> {review.rating}</div>
                <h3 className="mt-2 font-semibold">{review.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>
                <p className="mt-3 text-xs text-muted-foreground">{review.author} | {new Date(review.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          )) : <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No approved reviews yet.</div>}
        </div>
      </section>
    </section>
  );
}
