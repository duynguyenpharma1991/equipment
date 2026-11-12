import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/data/public";
import { pick } from "@/lib/i18n/config";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings();
  const name = pick(settings, "company_name", "vi");

  return {
    id: "/",
    name,
    short_name: name.length > 14 ? name.slice(0, 14).trim() : name,
    description: pick(settings, "tagline", "vi"),
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#007338",
    lang: "vi",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Sản phẩm / Products", url: "/vi/products" },
      { name: "Liên hệ / Contact", url: "/vi/contact" },
    ],
  };
}
