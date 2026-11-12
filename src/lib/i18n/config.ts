import type { Locale } from "@/lib/types";

export const locales: readonly Locale[] = ["vi", "en"];
export const defaultLocale: Locale = "vi";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Read `${field}_vi` / `${field}_en`, falling back to the other language when empty. */
export function pick<T extends object>(row: T, field: string, lang: Locale): string {
  const r = row as Record<string, unknown>;
  const primary = r[`${field}_${lang}`];
  const other = r[`${field}_${lang === "vi" ? "en" : "vi"}`];
  const text = typeof primary === "string" && primary.trim() ? primary : other;
  return typeof text === "string" ? text : "";
}

export function pickList<T extends object>(row: T, field: string, lang: Locale): string[] {
  const r = row as Record<string, unknown>;
  const primary = r[`${field}_${lang}`];
  const other = r[`${field}_${lang === "vi" ? "en" : "vi"}`];
  const list = Array.isArray(primary) && primary.length ? primary : other;
  return Array.isArray(list) ? (list as string[]) : [];
}

/** Prefix an internal path with the locale, e.g. localePath('en', '/products'). */
export function localePath(lang: Locale, path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}
