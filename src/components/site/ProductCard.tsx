import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import { pick } from "@/lib/i18n/config";
import type { Locale, ProductCardData } from "@/lib/types";

export function ProductCard({
  product,
  lang,
  featuredLabel,
}: {
  product: ProductCardData;
  lang: Locale;
  featuredLabel?: string;
}) {
  const name = pick(product, "name", lang);
  return (
    <Link href={`/${lang}/product/${product.slug}`} className="card" title={name}>
      <div className="card-media">
        <ProductImage src={product.featured_image} alt={name} />
        {product.is_featured && featuredLabel ? <span className="badge">{featuredLabel}</span> : null}
      </div>
      <div className="card-body">
        {product.model_code ? <span className="card-code">{product.model_code}</span> : null}
        <h3 className="card-title">{name}</h3>
      </div>
    </Link>
  );
}
