import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageBanner } from "@/components/site/PageBanner";
import { ProductCard } from "@/components/site/ProductCard";
import { SearchForm } from "@/components/site/SearchForm";
import { PageSkeleton } from "@/components/site/Skeleton";
import { getCategories, searchProducts } from "@/lib/data/public";
import { isLocale, pick } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/search">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).common.search, robots: { index: false, follow: true } };
}

export default function SearchPage(props: PageProps<"/[lang]/search">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SearchResults params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function SearchResults({
  params,
  searchParams,
}: Pick<PageProps<"/[lang]/search">, "params" | "searchParams">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { q } = await searchParams;
  const term = (Array.isArray(q) ? q[0] : q)?.slice(0, 80) ?? "";
  const dict = getDictionary(lang);
  const [results, categories] = await Promise.all([term ? searchProducts(term) : [], getCategories()]);

  return (
    <>
      <PageBanner
        title={term ? `${dict.search.resultsFor}: “${term}”` : dict.common.search}
        crumbs={[{ label: dict.nav.home, href: `/${lang}` }, { label: dict.common.search }]}
      />
      <section className="section">
        <div className="container">
          <div className="search-page-form">
            <SearchForm
              lang={lang}
              term={term}
              label={dict.common.search}
              placeholder={dict.common.searchPlaceholder}
            />
          </div>

          {results.length > 0 ? (
            <div className="grid grid-4">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} />
              ))}
            </div>
          ) : (
            <div className="search-empty">
              <p className="empty">{term ? `${dict.search.noResultsFor} “${term}”.` : dict.search.hint}</p>
              {categories.length > 0 ? (
                <>
                  <p className="search-help">{term ? dict.search.tryAnother : dict.search.browse}</p>
                  <div className="chips">
                    {categories.map((c) => (
                      <Link key={c.id} href={`/${lang}/category/${c.slug}`} className="chip">
                        {pick(c, "name", lang)}
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}
              {term ? (
                <p className="search-help">
                  {dict.search.needHelp} <Link href={`/${lang}/contact`}>{dict.search.contactUs}</Link>
                </p>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
