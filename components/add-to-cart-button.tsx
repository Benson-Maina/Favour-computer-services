"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product, size = "sm", buyNow = false, className }: { product: Product; size?: "sm" | "lg"; buyNow?: boolean; className?: string }) {
  const router = useRouter();
  const { addItem } = useCart();

  return (
    <Button
      type="button"
      size={size}
      className={className}
      disabled={product.stock <= 0}
      onClick={() => {
        addItem(product);
        if (buyNow) router.push("/checkout");
      }}
    >
      <ShoppingCart className="mr-2 size-4" />
      {buyNow ? "Buy Now" : product.stock > 0 ? "Add" : "Out of Stock"}
    </Button>
  );
}
