import type { Metadata } from "next";
import type { Locale } from "@/lib/types";

/** canonical + hreflang alternates for a locale-less path like "/products" or "/". */
export function alternatesFor(lang: Locale, path: string): NonNullable<Metadata["alternates"]> {
  const p = path === "/" ? "" : path;
  return {
    canonical: `/${lang}${p}`,
    languages: { vi: `/vi${p}`, en: `/en${p}`, "x-default": `/vi${p}` },
  };
}

export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}
