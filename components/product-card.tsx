"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

function ImageWithFallback({ src, alt, className, sizes }: { src: string; alt: string; className: string; sizes: string }) {
  const [hasError, setHasError] = useState(false);
  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3EImage unavailable%3C/text%3E%3C/svg%3E";

  return (
    <Image 
      src={hasError ? fallbackImage : src} 
      alt={alt} 
      fill 
      className={className}
      sizes={sizes}
      onError={() => setHasError(true)}
      priority={false}
    />
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-premium">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <ImageWithFallback 
            src={product.images[0]} 
            alt={product.name} 
            className="object-cover transition-transform duration-500 group-hover:scale-105" 
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          {product.badge ? <Badge className="absolute left-3 top-3">{product.badge}</Badge> : null}
        </div>
      </Link>
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">{product.brand}</p>
          <Link href={`/products/${product.slug}`} className="line-clamp-2 font-semibold hover:text-primary">
            {product.name}
          </Link>
        </div>
        <div className="flex items-center gap-1 text-sm text-amber-500">
          <Star className="size-4 fill-current" />
          <span>{product.rating}</span>
          <span className="text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="font-bold">{formatCurrency(product.salePrice ?? product.price)}</p>
            {product.compareAtPrice ? <p className="text-xs text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</p> : null}
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/products/${product.slug}`}>View</Link>
            </Button>
            <AddToCartButton product={product} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
