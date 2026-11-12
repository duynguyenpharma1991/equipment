import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeroSlider, type HeroSlide } from "@/components/site/HeroSlider";
import { JsonLd } from "@/components/site/JsonLd";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductImage } from "@/components/site/ProductImage";
import {
  getBanners,
  getCategories,
  getFeaturedProducts,
  getNews,
  getProducts,
  getSettings,
} from "@/lib/data/public";
import { getSiteUrl } from "@/lib/env";
import { isLocale, localePath, pick } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { alternatesFor } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { alternates: alternatesFor(lang, "/") };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const [banners, categories, featured, allProducts, news, settings] = await Promise.all([
    getBanners(),
    getCategories(),
    getFeaturedProducts(8),
    getProducts(),
    getNews(3),
    getSettings(),
  ]);

  const showcase = featured.length > 0 ? featured : allProducts.slice(0, 8);

  const slides: HeroSlide[] = banners.map((b) => ({
    id: b.id,
    title: pick(b, "title", lang),
    subtitle: pick(b, "subtitle", lang),
    buttonText: pick(b, "button_text", lang),
    href: b.link_url ? localePath(lang, b.link_url) : "",
    imageUrl: b.image_url,
  }));

  const siteUrl = getSiteUrl();
  const email = settings.email;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: pick(settings, "company_name", lang),
          url: `${siteUrl}/${lang}`,
          ...(email ? { email } : {}),
          ...(settings.phone ? { telephone: settings.phone } : {}),
        }}
      />

      <HeroSlider slides={slides} />

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>{dict.home.categories}</h2>
          </div>
          <div className="grid grid-3 stack">
            {categories.map((c) => (
              <Link key={c.id} href={`/${lang}/category/${c.slug}`} className="category-tile">
                <span className="category-icon" aria-hidden="true">
                  ⚙
                </span>
                <span>
                  {pick(c, "name", lang)}
                  {pick(c, "description", lang) ? <small>{pick(c, "description", lang)}</small> : null}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-title">
            <h2>{dict.home.featured}</h2>
          </div>
          {showcase.length > 0 ? (
            <div className="grid grid-4">
              {showcase.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} />
              ))}
            </div>
          ) : (
            <p className="empty">{dict.common.noProducts}</p>
          )}
          <div className="section-more">
            <Link href={`/${lang}/products`} className="btn btn-outline">
              {dict.common.viewAll}
            </Link>
          </div>
        </div>
      </section>

      {news.length > 0 ? (
        <section className="section">
          <div className="container">
            <div className="section-title">
              <h2>{dict.home.latestNews}</h2>
            </div>
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
            <div className="section-more">
              <Link href={`/${lang}/news`} className="btn btn-outline">
                {dict.common.viewAll}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="cta">
        <div className="container">
          <h2>{dict.home.ctaTitle}</h2>
          <p>{dict.home.ctaText}</p>
          <Link href={`/${lang}/contact`} className="btn btn-red">
            {dict.common.requestQuote}
          </Link>
        </div>
      </section>
    </>
  );
}
