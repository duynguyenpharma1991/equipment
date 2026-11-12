import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/site/InquiryForm";
import { PageBanner } from "@/components/site/PageBanner";
import { getSettings } from "@/lib/data/public";
import { getFallbackContactEmail } from "@/lib/env";
import { isLocale, pick } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { alternatesFor } from "@/lib/seo";
import { telHref } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).contact.title, alternates: alternatesFor(lang, "/contact") };
}

// Only Google Maps embeds are allowed so an arbitrary URL can't be framed.
const MAP_PREFIX = "https://www.google.com/maps/embed";

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const settings = await getSettings();
  const email = settings.email || getFallbackContactEmail();
  const address = pick(settings, "address", lang);
  const hours = pick(settings, "working_hours", lang);
  const mapUrl = settings.map_embed_url.startsWith(MAP_PREFIX) ? settings.map_embed_url : "";

  const rows: { label: string; node: React.ReactNode }[] = [];
  if (address) rows.push({ label: dict.contact.address, node: address });
  if (settings.phone)
    rows.push({ label: dict.contact.phone, node: <a href={telHref(settings.phone)}>{settings.phone}</a> });
  if (settings.hotline)
    rows.push({ label: dict.contact.hotline, node: <a href={telHref(settings.hotline)}>{settings.hotline}</a> });
  if (email) rows.push({ label: dict.contact.email, node: <a href={`mailto:${email}`}>{email}</a> });
  if (settings.whatsapp)
    rows.push({
      label: dict.contact.whatsapp,
      node: (
        <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
          {settings.whatsapp}
        </a>
      ),
    });
  if (settings.zalo)
    rows.push({
      label: dict.contact.zalo,
      node: (
        <a href={`https://zalo.me/${settings.zalo.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
          {settings.zalo}
        </a>
      ),
    });
  if (hours) rows.push({ label: dict.contact.hours, node: hours });

  return (
    <>
      <PageBanner
        title={dict.contact.title}
        crumbs={[{ label: dict.nav.home, href: `/${lang}` }, { label: dict.contact.title }]}
      />
      <section className="section">
        <div className="container contact-layout">
          <div>
            <h2>{pick(settings, "company_name", lang)}</h2>
            <p style={{ color: "var(--muted)" }}>{dict.contact.intro}</p>
            <ul className="contact-list">
              {rows.map((r) => (
                <li key={r.label}>
                  <strong>{r.label}</strong>
                  <span>{r.node}</span>
                </li>
              ))}
            </ul>
            {mapUrl ? (
              <iframe
                className="map-frame"
                src={mapUrl}
                title="Map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : null}
          </div>
          <div className="form-card">
            <h2 style={{ border: 0, padding: 0 }}>{dict.common.requestQuote}</h2>
            <p className="sub">{dict.product.inquirySub}</p>
            <InquiryForm lang={lang} labels={dict.form} />
          </div>
        </div>
      </section>
    </>
  );
}
