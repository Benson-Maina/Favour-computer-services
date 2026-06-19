"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";

export function CartIconLink() {
  const { totalItems, hydrated } = useCart();
  return (
    <Button asChild variant="ghost" size="icon" aria-label={`Cart${totalItems ? ` with ${totalItems} items` : ""}`} className="relative">
      <Link href="/cart">
        <ShoppingCart className="size-5" />
        {hydrated && totalItems > 0 ? <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{totalItems}</span> : null}
      </Link>
    </Button>
  );
}
