import Link from "next/link";
import { getBusinessSettings, getCategories, getProducts } from "@/lib/data";
import { AccountHeaderButton } from "@/components/account-header-button";
import { CartIconLink } from "@/components/cart-icon-link";
import { MobileMenu } from "@/components/mobile-menu";
import { SearchPanel } from "@/components/search-panel";
import { SocialLinksIcons } from "@/components/social-links";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["Categories", "/categories"],
  ["Services", "/services"],
  ["Blog", "/blog"],
  ["About", "/about"],
  ["Contact", "/contact"]
] as const;

export async function SiteHeader() {
  const [business, categories, products] = await Promise.all([getBusinessSettings(), getCategories(), getProducts({ limit: 20 })]);
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
      <div className="bg-slate-950 py-2 text-xs text-white">
        <div className="container flex flex-wrap items-center justify-between gap-2">
          <span>{business.location}</span>
          <div className="flex flex-wrap items-center gap-3">
            <span>Call or WhatsApp: {business.phone}</span>
            <SocialLinksIcons links={business.socialLinks} iconClassName="size-3.5" className="gap-0" variant="footer" />
          </div>
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
          <SearchPanel products={products} />
          <CartIconLink />
          <AccountHeaderButton />
          <ThemeToggle />
          <MobileMenu links={nav} socialLinks={business.socialLinks} />
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
