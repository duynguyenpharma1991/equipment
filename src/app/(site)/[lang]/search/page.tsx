import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageBanner } from "@/components/site/PageBanner";
import { ProductCard } from "@/components/site/ProductCard";
import { PageSkeleton } from "@/components/site/Skeleton";
import { searchProducts } from "@/lib/data/public";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/search">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).search.title, robots: { index: false, follow: true } };
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
  const results = term ? await searchProducts(term) : [];

  return (
    <>
      <PageBanner
        title={term ? `${dict.search.resultsFor}: “${term}”` : dict.search.title}
        crumbs={[{ label: dict.nav.home, href: `/${lang}` }, { label: dict.search.title }]}
      />
      <section className="section">
        <div className="container">
          {results.length > 0 ? (
            <div className="grid grid-4">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} />
              ))}
            </div>
          ) : (
            <p className="empty">{dict.common.noResults}</p>
          )}
        </div>
      </section>
    </>
  );
}
