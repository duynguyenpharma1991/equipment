import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/site/PageBanner";
import { ProductCard } from "@/components/site/ProductCard";
import { getCategories, getProducts } from "@/lib/data/public";
import { isLocale, pick } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/products">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: getDictionary(lang).nav.products,
    alternates: alternatesFor(lang, "/products"),
  };
}

export default async function ProductsPage({ params }: PageProps<"/[lang]/products">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <>
      <PageBanner
        title={dict.nav.products}
        crumbs={[{ label: dict.nav.home, href: `/${lang}` }, { label: dict.nav.products }]}
      />
      <section className="section">
        <div className="container">
          <div className="chips">
            <span className="chip active">{dict.common.allProducts}</span>
            {categories.map((c) => (
              <Link key={c.id} href={`/${lang}/category/${c.slug}`} className="chip">
                {pick(c, "name", lang)}
              </Link>
            ))}
          </div>
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
