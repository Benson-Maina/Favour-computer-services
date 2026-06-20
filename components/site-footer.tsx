import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getBusinessSettings, getCategories, getServices } from "@/lib/data";

export async function SiteFooter() {
  const [business, categories, services] = await Promise.all([getBusinessSettings(), getCategories(), getServices()]);
  return (
    <footer className="border-t bg-slate-950 text-slate-200">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">{business.name}</h2>
          <p className="text-sm text-slate-400">{business.description}</p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">Shop</h3>
          <div className="grid gap-2 text-sm">
            {categories.map((category) => <Link key={category.slug} href={`/categories/${category.slug}`} className="hover:text-white">{category.name}</Link>)}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">Services</h3>
          <div className="grid gap-2 text-sm">
            {services.map((service) => <Link key={service.slug} href={`/services/${service.slug}`} className="hover:text-white">{service.title}</Link>)}
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-white">Contact</h3>
          <p className="flex gap-2"><MapPin className="mt-0.5 size-4" /> {business.location}</p>
          <p className="flex gap-2"><Phone className="size-4" /> {business.phone}</p>
          <p className="flex gap-2"><Mail className="size-4" /> {business.email}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © 2026 {business.name}. All rights reserved.
      </div>
    </footer>
  );
}
