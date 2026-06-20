"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const galleryImages = images.filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(galleryImages[0] ?? "");

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-secondary">
        {selectedImage ? (
          <Image priority src={selectedImage} alt={name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        ) : null}
      </div>
      {galleryImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={`relative aspect-square overflow-hidden rounded-md border bg-secondary ${selectedImage === image ? "ring-2 ring-primary ring-offset-2" : ""}`}
              aria-label={`Show ${name} image ${index + 1}`}
            >
              <Image src={image} alt={`${name} view ${index + 1}`} fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
