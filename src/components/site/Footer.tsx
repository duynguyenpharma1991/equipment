import Link from "next/link";
import { cacheLife } from "next/cache";
import { Logo } from "@/components/site/Logo";
import { telHref } from "@/lib/utils";
import { getCategories, getSettings } from "@/lib/data/public";
import { getFallbackContactEmail } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pick } from "@/lib/i18n/config";
import type { Locale } from "@/lib/types";

export async function Footer({ lang }: { lang: Locale }) {
  // Cached so the current year is computed once per day instead of blocking prerender.
  "use cache";
  cacheLife("days");

  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const dict = getDictionary(lang);
  const email = settings.email || getFallbackContactEmail();
  const year = new Date().getFullYear();
  const name = pick(settings, "company_name", lang);
  const address = pick(settings, "address", lang);
  const hours = pick(settings, "working_hours", lang);
  const socials = [
    { label: "Facebook", href: settings.facebook },
    { label: "YouTube", href: settings.youtube },
    { label: "LinkedIn", href: settings.linkedin },
  ].filter((s) => s.href);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Logo href={`/${lang}`} name={name} />
          <p style={{ marginTop: 14 }}>{pick(settings, "tagline", lang)}</p>
          {socials.length > 0 ? (
            <p>
              {socials.map((s, i) => (
                <span key={s.label}>
                  {i > 0 ? " · " : ""}
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
        </div>

        <div>
          <h3>{dict.footer.categories}</h3>
          <ul>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/${lang}/category/${c.slug}`}>{pick(c, "name", lang)}</Link>
              </li>
            ))}
            <li>
              <Link href={`/${lang}/news`}>{dict.nav.news}</Link>
            </li>
            <li>
              <Link href={`/${lang}/videos`}>{dict.nav.videos}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3>{dict.footer.contactUs}</h3>
          <ul>
            <li>
              <strong>{name}</strong>
            </li>
            {address ? <li>⌖ {address}</li> : null}
            {settings.phone ? (
              <li>
                ☎ <a href={telHref(settings.phone)}>{settings.phone}</a>
              </li>
            ) : null}
            {settings.hotline ? (
              <li>
                ☎ {dict.contact.hotline}: <a href={telHref(settings.hotline)}>{settings.hotline}</a>
              </li>
            ) : null}
            {email ? (
              <li>
                ✉ <a href={`mailto:${email}`}>{email}</a>
              </li>
            ) : null}
            {hours ? <li>⏱ {hours}</li> : null}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        © {year} {name}. {dict.footer.rights}
      </div>
    </footer>
  );
}
