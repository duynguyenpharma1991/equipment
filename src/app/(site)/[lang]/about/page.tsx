import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/site/Markdown";
import { PageBanner } from "@/components/site/PageBanner";
import { getSettings } from "@/lib/data/public";
import { isLocale, pick } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).about.title, alternates: alternatesFor(lang, "/about") };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const settings = await getSettings();
  const content = pick(settings, "about", lang);

  return (
    <>
      <PageBanner
        title={dict.about.title}
        crumbs={[{ label: dict.nav.home, href: `/${lang}` }, { label: dict.about.title }]}
      />
      <section className="section">
        <div className="container">
          {content ? <Markdown>{content}</Markdown> : <p className="empty">—</p>}
        </div>
      </section>
    </>
  );
}
