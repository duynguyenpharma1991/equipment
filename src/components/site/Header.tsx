import { Suspense } from "react";
import { Logo } from "@/components/site/Logo";
import { NavMenu } from "@/components/site/NavMenu";
import { LanguageSwitcher, LanguageSwitcherFallback } from "@/components/site/LanguageSwitcher";
import { getCategories, getSettings } from "@/lib/data/public";
import { getFallbackContactEmail } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pick } from "@/lib/i18n/config";
import { telHref } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export async function Header({ lang }: { lang: Locale }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const dict = getDictionary(lang);
  const email = settings.email || getFallbackContactEmail();
  const phone = settings.hotline || settings.phone;

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container">
          <div className="topbar-info">
            {email ? <a href={`mailto:${email}`}>✉ {email}</a> : null}
            {phone ? <a href={telHref(phone)}>☎ {phone}</a> : null}
          </div>
          <Suspense fallback={<LanguageSwitcherFallback current={lang} />}>
            <LanguageSwitcher current={lang} />
          </Suspense>
        </div>
      </div>
      <div className="container mainbar">
        <Logo href={`/${lang}`} name={pick(settings, "company_name", lang)} />
        <NavMenu
          lang={lang}
          labels={dict.nav}
          searchLabel={dict.common.search}
          searchPlaceholder={dict.common.searchPlaceholder}
          categories={categories.map((c) => ({ slug: c.slug, name: pick(c, "name", lang) }))}
        />
      </div>
    </header>
  );
}
