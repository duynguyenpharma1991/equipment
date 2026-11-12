import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Gallery } from "@/components/site/Gallery";
import { InquiryForm } from "@/components/site/InquiryForm";
import { JsonLd } from "@/components/site/JsonLd";
import { Markdown } from "@/components/site/Markdown";
import { PageBanner } from "@/components/site/PageBanner";
import { ProductCard } from "@/components/site/ProductCard";
import { PageSkeleton } from "@/components/site/Skeleton";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import {
  getCategories,
  getProductBySlug,
  getProductSlugs,
  getRelatedProducts,
} from "@/lib/data/public";
import { getSiteUrl } from "@/lib/env";
import { isLocale, pick, pickList } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { alternatesFor, truncate } from "@/lib/seo";

const PLACEHOLDER = "__placeholder__";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  // Cache Components requires at least one param to validate the route.
  return (slugs.length ? slugs : [PLACEHOLDER]).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/product/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const product = await getProductBySlug(slug);
  if (!product) return { title: getDictionary(lang).notFound.title, robots: { index: false } };

  const name = pick(product, "name", lang);
  const title = pick(product, "seo_title", lang) || [product.model_code, name].filter(Boolean).join(" – ");
  const description = pick(product, "seo_description", lang) || truncate(pick(product, "summary", lang));
  return {
    title,
    description: description || undefined,
    alternates: alternatesFor(lang, `/product/${slug}`),
    openGraph: {
      title,
      description: description || undefined,
      images: product.featured_image ? [{ url: product.featured_image }] : undefined,
    },
  };
}

export default function ProductPage(props: PageProps<"/[lang]/product/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductContent params={props.params} />
    </Suspense>
  );
}

async function ProductContent({ params }: Pick<PageProps<"/[lang]/product/[slug]">, "params">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const dict = getDictionary(lang);
  const [categories, related] = await Promise.all([
    getCategories(),
    getRelatedProducts(product.category_id, product.id, 4),
  ]);
  const category = categories.find((c) => c.id === product.category_id);

  const name = pick(product, "name", lang);
  const summary = pick(product, "summary", lang);
  const description = pick(product, "description", lang);
  const features = pickList(product, "features", lang);
  const images = [product.featured_image, ...(product.gallery ?? [])].filter(
    (u, i, arr): u is string => !!u && arr.indexOf(u) === i,
  );
  const siteUrl = getSiteUrl();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name,
          ...(product.model_code ? { sku: product.model_code, mpn: product.model_code } : {}),
          ...(summary ? { description: summary } : {}),
          ...(images.length ? { image: images } : {}),
          ...(category ? { category: pick(category, "name", lang) } : {}),
          url: `${siteUrl}/${lang}/product/${product.slug}`,
        }}
      />

      <PageBanner
        title={name}
        crumbs={[
          { label: dict.nav.home, href: `/${lang}` },
          { label: dict.nav.products, href: `/${lang}/products` },
          ...(category
            ? [{ label: pick(category, "name", lang), href: `/${lang}/category/${category.slug}` }]
            : []),
          { label: product.model_code || name },
        ]}
      />

      <section className="section">
        <div className="container">
          <div className="product-top">
            <Gallery images={images} alt={name} />
            <div className="product-info">
              {product.model_code ? <span className="model">{product.model_code}</span> : null}
              <h2 style={{ fontSize: "clamp(22px,2.4vw,30px)" }}>{name}</h2>
              {category ? (
                <p className="product-meta">
                  {dict.common.category}:{" "}
                  <Link href={`/${lang}/category/${category.slug}`}>{pick(category, "name", lang)}</Link>
                </p>
              ) : null}
              {summary ? <p>{summary}</p> : null}
              <div className="product-actions">
                <a href="#inquiry" className="btn btn-red">
                  {dict.common.requestQuote}
                </a>
                {product.brochure_url ? (
                  <a href={product.brochure_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                    {dict.product.brochure}
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {description ? (
            <div className="block">
              <h2>{dict.product.description}</h2>
              <Markdown>{description}</Markdown>
            </div>
          ) : null}

          {features.length > 0 ? (
            <div className="block">
              <h2>{dict.product.features}</h2>
              <ol className="features-list">
                {features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ol>
            </div>
          ) : null}

          {product.specs?.length > 0 ? (
            <div className="block">
              <h2>{dict.product.specs}</h2>
              {product.specs.map((group, gi) => (
                <div className="table-wrap" key={gi}>
                  <table className="spec-table">
                    {pick(group, "title", lang) ? <caption>{pick(group, "title", lang)}</caption> : null}
                    <thead>
                      <tr>
                        <th scope="col">{dict.product.parameter}</th>
                        <th scope="col">{dict.product.value}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((row, ri) => (
                        <tr key={ri}>
                          <th scope="row">{pick(row, "label", lang)}</th>
                          <td>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : null}

          {product.video_url ? (
            <div className="block">
              <h2>{dict.product.video}</h2>
              <div style={{ maxWidth: 760 }}>
                <VideoPlayer url={product.video_url} title={name} />
              </div>
            </div>
          ) : null}

          <div className="block" id="inquiry">
            <div className="form-card" style={{ maxWidth: 820 }}>
              <h2 style={{ border: 0, padding: 0 }}>{dict.product.inquiry}</h2>
              <p className="sub">{dict.product.inquirySub}</p>
              <InquiryForm
                lang={lang}
                labels={dict.form}
                productId={product.id}
                productName={[product.model_code, name].filter(Boolean).join(" – ")}
              />
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section alt">
          <div className="container">
            <div className="section-title">
              <h2>{dict.product.related}</h2>
            </div>
            <div className="grid grid-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
