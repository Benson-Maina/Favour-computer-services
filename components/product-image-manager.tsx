"use client";

import { GripVertical, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProductImageManager({ images, productName }: { images: string[]; productName: string }) {
  const initialImages = useMemo(() => images.filter(Boolean), [images]);
  const [orderedImages, setOrderedImages] = useState(initialImages);
  const [featuredImage, setFeaturedImage] = useState(initialImages[0] ?? "");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function moveImage(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    setOrderedImages((current) => {
      const next = [...current];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  }

  function removeImage(image: string) {
    setOrderedImages((current) => current.filter((item) => item !== image));
    if (featuredImage === image) setFeaturedImage(orderedImages.find((item) => item !== image) ?? "");
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="images" value={JSON.stringify(orderedImages)} />
      <input type="hidden" name="featuredImage" value={featuredImage} />
      <Input name="productImages" type="file" accept="image/jpeg,image/png,image/webp" multiple />
      {orderedImages.length ? (
        <div className="grid gap-2">
          {orderedImages.map((image, index) => (
            <div
              key={image}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => moveImage(index)}
              className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-md border p-2"
            >
              <div className="relative size-12 overflow-hidden rounded bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={`${productName} image ${index + 1}`} className="size-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{image}</p>
                <p className="text-xs font-medium">{featuredImage === image ? "Featured image" : `Gallery image ${index + 1}`}</p>
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" aria-label="Drag to reorder">
                  <GripVertical className="size-4" />
                </Button>
                <Button type="button" variant={featuredImage === image ? "default" : "ghost"} size="icon" aria-label="Set featured image" onClick={() => setFeaturedImage(image)}>
                  <Star className="size-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Remove image" onClick={() => removeImage(image)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">Upload product images. The first saved image becomes the featured image.</p>
      )}
    </div>
  );
}
