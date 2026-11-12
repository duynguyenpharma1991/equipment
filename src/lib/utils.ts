import type { Locale } from "@/lib/types";

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function formatDate(iso: string | null | undefined, lang: Locale): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(iso));
}

export type ParsedVideo =
  | { kind: "youtube"; id: string; embedUrl: string; thumbnail: string }
  | { kind: "file"; url: string }
  | { kind: "unknown"; url: string };

export function parseVideoUrl(raw: string): ParsedVideo {
  const url = raw.trim();
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (yt) {
    const id = yt[1];
    return {
      kind: "youtube",
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return { kind: "file", url };
  return { kind: "unknown", url };
}

/** Escape a user string for safe use inside a PostgREST `ilike` filter value. */
export function escapeLike(term: string): string {
  return term.replace(/[%_\\,()*"':;]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}
