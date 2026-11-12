"use client";

import { useState } from "react";
import { ProductImage } from "@/components/site/ProductImage";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? null;

  return (
    <div>
      <div className="gallery-main">
        <ProductImage src={current} alt={alt} sizes="(max-width: 900px) 100vw, 50vw" priority />
      </div>
      {images.length > 1 ? (
        <div className="gallery-thumbs">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              aria-current={i === active}
              aria-label={`${alt} ${i + 1}`}
              onClick={() => setActive(i)}
            >
              <ProductImage src={src} alt="" sizes="82px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
