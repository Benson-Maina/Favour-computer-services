"use client";

import { GripVertical, Star, Trash2, Upload } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductImageManager({ images, productName }: { images: string[]; productName: string }) {
  const initialImages = useMemo(() => images.filter(Boolean), [images]);
  const [orderedImages, setOrderedImages] = useState(initialImages);
  const [featuredImage, setFeaturedImage] = useState(initialImages[0] ?? "");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [previews, setPreviews] = useState<{ url: string; name: string }[]>([]);
  const [dragOver, setDragOver] = useState(false);

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

  const handleFiles = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setPreviews((current) => [...current, { url, name: file.name }]);
    });
  }, []);

  return (
    <div className="space-y-3">
      <input type="hidden" name="images" value={JSON.stringify(orderedImages)} />
      <input type="hidden" name="featuredImage" value={featuredImage} />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length) handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/20"
        )}
      >
        <Upload className="mx-auto mb-2 size-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Drag and drop images here</p>
        <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, or WebP — multiple files supported</p>
        <label className="mt-3 inline-block">
          <span className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Browse files</span>
          <input name="productImages" type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(event) => event.target.files && handleFiles(event.target.files)} />
        </label>
      </div>

      {previews.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {previews.map((preview) => (
            <div key={preview.url} className="flex items-center gap-3 rounded-md border border-border p-2">
              <div className="relative size-14 overflow-hidden rounded bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.url} alt={preview.name} className="size-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{preview.name}</p>
                <p className="text-xs text-muted-foreground">New upload — save to publish</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {orderedImages.length ? (
        <div className="grid gap-2">
          {orderedImages.map((image, index) => (
            <div
              key={image}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => moveImage(index)}
              className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-md border border-border p-2"
            >
              <div className="relative size-14 overflow-hidden rounded bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={`${productName} image ${index + 1}`} className="size-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{featuredImage === image ? "Featured image" : `Gallery image ${index + 1}`}</p>
                <p className="truncate text-xs text-muted-foreground">{image}</p>
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
        <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">No saved images yet. Upload images above.</p>
      )}
    </div>
  );
}
