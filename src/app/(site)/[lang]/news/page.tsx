import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/site/PageBanner";
import { ProductImage } from "@/components/site/ProductImage";
import { getNews } from "@/lib/data/public";
import { isLocale, pick } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { alternatesFor } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[lang]/news">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).news.title, alternates: alternatesFor(lang, "/news") };
}

export default async function NewsPage({ params }: PageProps<"/[lang]/news">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const news = await getNews(60);

  return (
    <>
      <PageBanner
        title={dict.news.title}
        crumbs={[{ label: dict.nav.home, href: `/${lang}` }, { label: dict.news.title }]}
      />
      <section className="section">
        <div className="container">
          {news.length > 0 ? (
            <div className="grid grid-3 stack">
              {news.map((n) => (
                <Link key={n.id} href={`/${lang}/news/${n.slug}`} className="card news-card">
                  <div className="card-media">
                    <ProductImage src={n.cover_image} alt={pick(n, "title", lang)} sizes="(max-width: 900px) 100vw, 33vw" />
                  </div>
                  <div className="card-body">
                    <span className="card-meta">{formatDate(n.published_at, lang)}</span>
                    <h3 className="card-title">{pick(n, "title", lang)}</h3>
                    <p className="card-text">{pick(n, "excerpt", lang)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty">{dict.common.noNews}</p>
          )}
        </div>
      </section>
    </>
  );
}
