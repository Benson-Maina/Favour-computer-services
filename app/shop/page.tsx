import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop Electronics Nairobi",
  description: "Shop laptops, desktops, phones, SSDs, accessories, and CCTV systems in Nairobi."
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; brand?: string; q?: string; sort?: string }> }) {
  const query = await searchParams;
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const q = query.q?.toLowerCase() ?? "";
  const filtered = products
    .filter((product) => !query.category || product.category.toLowerCase() === query.category.toLowerCase())
    .filter((product) => !query.brand || product.brand.toLowerCase() === query.brand.toLowerCase())
    .filter((product) => !q || `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(q))
    .sort((a, b) => {
      if (query.sort === "price-low") return a.price - b.price;
      if (query.sort === "price-high") return b.price - a.price;
      if (query.sort === "best-selling") return Number(b.bestSelling) - Number(a.bestSelling);
      return b.createdAt.localeCompare(a.createdAt);
    });
  const brands = Array.from(new Set(products.map((product) => product.brand))).sort();

  return (
    <section className="container py-12">
      <SectionHeading eyebrow="Shop" title="Electronics Store Nairobi" description="Use filters to find genuine laptops, phones, desktops, storage, accessories, and CCTV kits." />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardContent className="space-y-5 p-5">
            <form className="space-y-4">
              <Input name="q" placeholder="Search products" defaultValue={query.q} />
              <select name="category" defaultValue={query.category ?? ""} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">All categories</option>
                {categories.map((category) => <option key={category.slug} value={category.name}>{category.name}</option>)}
              </select>
              <select name="brand" defaultValue={query.brand ?? ""} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">All brands</option>
                {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
              </select>
              <select name="availability" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option>In stock</option>
                <option>All availability</option>
              </select>
              <select name="rating" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option>4 stars and up</option>
                <option>All ratings</option>
              </select>
              <select name="sort" defaultValue={query.sort ?? "newest"} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="newest">Newest</option>
                <option value="price-low">Price Low to High</option>
                <option value="price-high">Price High to Low</option>
                <option value="best-selling">Best Selling</option>
              </select>
              <button className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground">Apply Filters</button>
            </form>
          </CardContent>
        </Card>
        <div>
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{filtered.length} products found</span>
            <span>Page 1 of 1</span>
          </div>
          {filtered.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-10 text-center">
              <h2 className="text-xl font-bold">No products found</h2>
              <p className="mt-2 text-sm text-muted-foreground">Try a different product name, category, or brand.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
