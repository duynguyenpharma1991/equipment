import Image from "next/image";

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : "";
  } catch {
    return "";
  }
})();

function isOptimizable(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    return !!supabaseHost && new URL(src).hostname === supabaseHost;
  } catch {
    return false;
  }
}

/**
 * Fills its (position: relative) parent. Images stored in our Supabase bucket go
 * through next/image; any other URL pasted into the admin falls back to a plain <img>
 * so an unconfigured remote host can never crash a page.
 */
export function SafeImage({
  src,
  alt,
  sizes = "(max-width: 900px) 50vw, 25vw",
  priority = false,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (isOptimizable(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
