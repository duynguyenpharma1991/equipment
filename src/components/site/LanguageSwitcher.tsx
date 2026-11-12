"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales } from "@/lib/i18n/config";
import type { Locale } from "@/lib/types";

const LABELS: Record<Locale, string> = { vi: "Tiếng Việt", en: "English" };

function swap(pathname: string, target: Locale): string {
  const parts = pathname.split("/");
  // parts[0] === "" ; parts[1] is the current locale segment
  if (parts[1] && (locales as readonly string[]).includes(parts[1])) {
    parts[1] = target;
    return parts.join("/") || `/${target}`;
  }
  return `/${target}`;
}

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {locales.map((l) =>
        l === current ? (
          <span key={l} className="active" aria-current="true">
            {LABELS[l]}
          </span>
        ) : (
          <Link
            key={l}
            href={swap(pathname, l)}
            hrefLang={l}
            onClick={() => {
              document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; samesite=lax`;
            }}
          >
            {LABELS[l]}
          </Link>
        ),
      )}
    </div>
  );
}

/** Static fallback shown while the pathname is resolving (no JS needed). */
export function LanguageSwitcherFallback({ current }: { current: Locale }) {
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {locales.map((l) =>
        l === current ? (
          <span key={l} className="active">
            {LABELS[l]}
          </span>
        ) : (
          <Link key={l} href={`/${l}`} hrefLang={l}>
            {LABELS[l]}
          </Link>
        ),
      )}
    </div>
  );
}
