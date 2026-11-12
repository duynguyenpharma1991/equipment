import { SafeImage } from "@/components/site/SafeImage";

export function ImagePlaceholder() {
  return (
    <div className="placeholder" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="26" width="34" height="22" rx="3" />
        <path d="M40 32h10l8 8v8H40" />
        <circle cx="16" cy="50" r="4" />
        <circle cx="48" cy="50" r="4" />
        <path d="M14 26v-8h14v8" />
      </svg>
    </div>
  );
}

/** Product / news image area. Parent must be `position: relative` with an aspect ratio. */
export function ProductImage({
  src,
  alt,
  sizes,
  priority,
}: {
  src: string | null | undefined;
  alt: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) return <ImagePlaceholder />;
  return <SafeImage src={src} alt={alt} sizes={sizes} priority={priority} />;
}
