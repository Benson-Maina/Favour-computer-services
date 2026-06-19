"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/types";

export function SearchPanel({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchSuggestions = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => {
      [product.name, product.brand, product.category].filter(Boolean).forEach((term) => counts.set(term, (counts.get(term) ?? 0) + 1));
    });
    return Array.from(counts, ([term, count]) => ({ term, count })).sort((a, b) => b.count - a.count);
  }, [products]);
  const trendingProducts = useMemo(() => products.filter((product) => product.bestSelling || product.featured).map((product) => product.name), [products]);
  const matches = useMemo(() => {
    const term = query.toLowerCase();
    return products
      .filter((product) => !term || `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(term))
      .slice(0, 5);
  }, [query]);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setOpen((value) => !value)}>
        {open ? <X className="size-5" /> : <Search className="size-5" />}
      </Button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(92vw,420px)] rounded-md border bg-background p-4 shadow-premium">
          <form action="/shop" className="flex gap-2">
            <Input name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search laptops, SSDs, brands" autoFocus />
            <Button size="icon" aria-label="Submit search"><Search className="size-4" /></Button>
          </form>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Suggestions</p>
              <div className="space-y-2">
                {searchSuggestions.slice(0, 4).map((item) => (
                  <Link key={item.term} href={`/shop?q=${encodeURIComponent(item.term)}`} className="block rounded-md px-2 py-1 text-sm hover:bg-secondary">
                    {item.term} <span className="text-muted-foreground">({item.count})</span>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Recent</p>
              <div className="space-y-2">
                {products.slice(0, 4).map((product) => product.name).map((term) => (
                  <Link key={term} href={`/shop?q=${encodeURIComponent(term)}`} className="block rounded-md px-2 py-1 text-sm hover:bg-secondary">{term}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><TrendingUp className="size-3" />Trending Products</p>
            <div className="space-y-2">
              {(query ? matches.map((product) => product.name) : trendingProducts).slice(0, 4).map((name) => (
                <Link key={name} href={`/shop?q=${encodeURIComponent(name)}`} className="block rounded-md px-2 py-1 text-sm hover:bg-secondary">{name}</Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
