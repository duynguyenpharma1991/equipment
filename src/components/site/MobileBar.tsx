import Link from "next/link";
import { telHref } from "@/lib/utils";
import { getSettings } from "@/lib/data/public";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/types";

/** Fixed bottom bar on small screens (home / call / products / contact). */
export async function MobileBar({ lang }: { lang: Locale }) {
  const settings = await getSettings();
  const dict = getDictionary(lang);
  const phone = settings.hotline || settings.phone;

  return (
    <nav className="mobile-bar" aria-label="Quick actions">
      <Link href={`/${lang}`}>
        <span aria-hidden="true">⌂</span>
        {dict.mobile.home}
      </Link>
      {phone ? (
        <a href={telHref(phone)} className="call">
          <span aria-hidden="true">☎</span>
          {dict.mobile.call}
        </a>
      ) : (
        <Link href={`/${lang}/search`}>
          <span aria-hidden="true">⌕</span>
          {dict.common.search}
        </Link>
      )}
      <Link href={`/${lang}/products`}>
        <span aria-hidden="true">▦</span>
        {dict.mobile.products}
      </Link>
      <Link href={`/${lang}/contact`}>
        <span aria-hidden="true">✉</span>
        {dict.mobile.contact}
      </Link>
    </nav>
  );
}
