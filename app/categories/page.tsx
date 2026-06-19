import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { categories } from "@/lib/data";

export default function CategoriesPage() {
  return (
    <section className="container py-12">
      <SectionHeading eyebrow="Departments" title="Product Categories" />
      <div className="grid gap-5 md:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.slug} href={`/categories/${category.slug}`} className="group overflow-hidden rounded-lg border">
            <div className="relative aspect-[4/3]"><Image src={category.image} alt={category.name} fill className="object-cover transition-transform group-hover:scale-105" sizes="33vw" /></div>
            <div className="p-5"><h2 className="font-bold">{category.name}</h2><p className="mt-2 text-sm text-muted-foreground">{category.subcategories.join(" • ")}</p></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
