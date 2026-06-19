import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { getCategories } from "@/lib/data";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <section className="container py-12">
      <SectionHeading eyebrow="Departments" title="Product Categories" />
      <div className="grid gap-5 md:grid-cols-3">
        {categories.length ? categories.map((category) => (
          <Link key={category.slug} href={`/categories/${category.slug}`} className="group overflow-hidden rounded-lg border">
            <div className="relative aspect-[4/3] bg-secondary">{category.image ? <Image src={category.image} alt={category.name} fill className="object-cover transition-transform group-hover:scale-105" sizes="33vw" /> : null}</div>
            <div className="p-5"><h2 className="font-bold">{category.name}</h2><p className="mt-2 text-sm text-muted-foreground">{category.subcategories.join(" | ")}</p></div>
          </Link>
        )) : <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground md:col-span-3">No categories added yet.</div>}
      </div>
    </section>
  );
}
