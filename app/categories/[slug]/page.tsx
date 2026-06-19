import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { categories, products } from "@/lib/data";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const items = products.filter((product) => product.category === category.name);

  return (
    <section className="container py-12">
      <SectionHeading eyebrow="Category" title={category.name} description={category.description} />
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {category.subcategories.map((sub) => <span key={sub} className="rounded-md bg-secondary px-3 py-1 text-sm">{sub}</span>)}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{items.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </section>
  );
}
