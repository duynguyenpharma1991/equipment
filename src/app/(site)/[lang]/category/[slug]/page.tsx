import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageBanner } from "@/components/site/PageBanner";
import { ProductCard } from "@/components/site/ProductCard";
import { PageSkeleton } from "@/components/site/Skeleton";
import {
  getCategories,
  getCategoryBySlug,
  getCategorySlugs,
  getProductsByCategory,
} from "@/lib/data/public";
import { isLocale, pick } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { alternatesFor, truncate } from "@/lib/seo";

const PLACEHOLDER = "__placeholder__";

export async function generateStaticParams() {
  const slugs = await getCategorySlugs();
  // Cache Components requires at least one param to validate the route.
  return (slugs.length ? slugs : [PLACEHOLDER]).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/category/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: getDictionary(lang).notFound.title, robots: { index: false } };
  const description = pick(category, "description", lang);
  return {
    title: pick(category, "name", lang),
    description: description ? truncate(description) : undefined,
    alternates: alternatesFor(lang, `/category/${slug}`),
  };
}

export default function CategoryPage(props: PageProps<"/[lang]/category/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CategoryContent params={props.params} />
    </Suspense>
  );
}

async function CategoryContent({ params }: Pick<PageProps<"/[lang]/category/[slug]">, "params">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const dict = getDictionary(lang);
  const [products, categories] = await Promise.all([
    getProductsByCategory(category.id),
    getCategories(),
  ]);
  const description = pick(category, "description", lang);

  return (
    <>
      <PageBanner
        title={pick(category, "name", lang)}
        crumbs={[
          { label: dict.nav.home, href: `/${lang}` },
          { label: dict.nav.products, href: `/${lang}/products` },
          { label: pick(category, "name", lang) },
        ]}
      />
      <section className="section">
        <div className="container">
          <div className="chips">
            <Link href={`/${lang}/products`} className="chip">
              {dict.common.allProducts}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/${lang}/category/${c.slug}`}
                className={`chip${c.id === category.id ? " active" : ""}`}
                aria-current={c.id === category.id ? "page" : undefined}
              >
                {pick(c, "name", lang)}
              </Link>
            ))}
          </div>
          {description ? <p style={{ marginTop: 0, color: "var(--muted)" }}>{description}</p> : null}
          {products.length > 0 ? (
            <div className="grid grid-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} />
              ))}
            </div>
          ) : (
            <p className="empty">{dict.common.noProducts}</p>
          )}
        </div>
      </section>
    </>
  );
}
