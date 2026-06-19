import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  return (
    <Card className="group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-premium">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {image ? (
            <Image src={image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" />
          ) : null}
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
