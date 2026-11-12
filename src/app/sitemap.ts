import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/data/public";
import { getSiteUrl } from "@/lib/env";
import { locales } from "@/lib/i18n/config";

type Entry = MetadataRoute.Sitemap[number];

function entry(path: string, lastModified?: string, priority = 0.6): Entry[] {
  const base = getSiteUrl();
  const languages = Object.fromEntries(locales.map((l) => [l, `${base}/${l}${path}`]));
  return locales.map((l) => ({
    url: `${base}/${l}${path}`,
    lastModified: lastModified ? new Date(lastModified) : undefined,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories, news } = await getSitemapData();

  return [
    ...entry("", undefined, 1),
    ...["/products", "/news", "/videos", "/about", "/contact"].flatMap((p) => entry(p, undefined, 0.7)),
    ...categories.flatMap((c) => entry(`/category/${c.slug}`, c.updated_at, 0.7)),
    ...products.flatMap((p) => entry(`/product/${p.slug}`, p.updated_at, 0.8)),
    ...news.flatMap((n) => entry(`/news/${n.slug}`, n.updated_at, 0.5)),
  ];
}
