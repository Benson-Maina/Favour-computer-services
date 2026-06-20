"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MobileMenu({ links }: { links: ReadonlyArray<readonly [string, string]> }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button type="button" variant="ghost" size="icon" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>
      {open ? (
        <div className="absolute left-0 right-0 top-full border-b bg-background shadow-lg">
          <nav className="container grid gap-1 py-3">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-md px-3 py-3 text-sm font-medium hover:bg-secondary" onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
