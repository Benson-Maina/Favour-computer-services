import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { getCategories, getProducts } from "@/lib/data";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
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
