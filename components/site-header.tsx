import Link from "next/link";
import { Menu, UserRound } from "lucide-react";
import { business, categories } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { CartIconLink } from "@/components/cart-icon-link";
import { SearchPanel } from "@/components/search-panel";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["Categories", "/categories"],
  ["Services", "/services"],
  ["Blog", "/blog"],
  ["About", "/about"],
  ["Contact", "/contact"]
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
      <div className="bg-slate-950 py-2 text-xs text-white">
        <div className="container flex flex-wrap items-center justify-between gap-2">
          <span>{business.location}</span>
          <span>Call or WhatsApp: {business.phone}</span>
        </div>
      </div>
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">FC</span>
          <span className="hidden sm:inline">Favour Computer Services</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <SearchPanel />
          <CartIconLink />
          <Button asChild variant="ghost" size="icon" aria-label="Account">
            <Link href="/account"><UserRound className="size-5" /></Link>
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
            <Menu className="size-5" />
          </Button>
        </div>
      </div>
      <div className="hidden border-t bg-secondary/40 py-2 md:block">
        <div className="container flex gap-3 overflow-x-auto text-sm">
          {categories.map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}`} className="whitespace-nowrap text-muted-foreground hover:text-primary">
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
