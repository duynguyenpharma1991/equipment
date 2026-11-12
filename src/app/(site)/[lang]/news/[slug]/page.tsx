import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/site/JsonLd";
import { Markdown } from "@/components/site/Markdown";
import { PageBanner } from "@/components/site/PageBanner";
import { ProductImage } from "@/components/site/ProductImage";
import { PageSkeleton } from "@/components/site/Skeleton";
import { getNewsBySlug, getNewsSlugs } from "@/lib/data/public";
import { getSiteUrl } from "@/lib/env";
import { isLocale, pick } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { alternatesFor, truncate } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

const PLACEHOLDER = "__placeholder__";

export async function generateStaticParams() {
  const slugs = await getNewsSlugs();
  return (slugs.length ? slugs : [PLACEHOLDER]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/news/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const post = await getNewsBySlug(slug);
  if (!post) return { title: getDictionary(lang).notFound.title, robots: { index: false } };
  const title = pick(post, "seo_title", lang) || pick(post, "title", lang);
  const description = pick(post, "seo_description", lang) || truncate(pick(post, "excerpt", lang));
  return {
    title,
    description: description || undefined,
    alternates: alternatesFor(lang, `/news/${slug}`),
    openGraph: {
      type: "article",
      title,
      description: description || undefined,
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
  };
}

export default function NewsPostPage(props: PageProps<"/[lang]/news/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewsPostContent params={props.params} />
    </Suspense>
  );
}

async function NewsPostContent({ params }: Pick<PageProps<"/[lang]/news/[slug]">, "params">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  const dict = getDictionary(lang);
  const title = pick(post, "title", lang);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          datePublished: post.published_at ?? undefined,
          dateModified: post.updated_at,
          ...(post.cover_image ? { image: [post.cover_image] } : {}),
          mainEntityOfPage: `${getSiteUrl()}/${lang}/news/${post.slug}`,
        }}
      />
      <PageBanner
        title={title}
        crumbs={[
          { label: dict.nav.home, href: `/${lang}` },
          { label: dict.news.title, href: `/${lang}/news` },
          { label: title },
        ]}
      />
      <article className="section">
        <div className="container">
          <p className="card-meta">
            {dict.common.publishedOn}: {formatDate(post.published_at, lang)}
          </p>
          {post.cover_image ? (
            <div className="gallery-main" style={{ maxWidth: 860, aspectRatio: "16 / 9", marginBottom: 24 }}>
              <ProductImage src={post.cover_image} alt={title} sizes="(max-width: 900px) 100vw, 860px" priority />
            </div>
          ) : null}
          <Markdown>{pick(post, "content", lang)}</Markdown>
          <p style={{ marginTop: 32 }}>
            <Link href={`/${lang}/news`} className="btn btn-outline">
              ← {dict.news.back}
            </Link>
          </p>
        </div>
      </article>
    </>
  );
}
