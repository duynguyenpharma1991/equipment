import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { defaultSettings } from "@/lib/data/defaults";
import { escapeLike } from "@/lib/utils";
import type {
  Banner,
  Category,
  GeneralSettings,
  NewsCardData,
  NewsPost,
  Product,
  ProductCardData,
  Video,
} from "@/lib/types";

/**
 * Cached, anonymous reads for the public site. Each function is tagged so the
 * admin area can invalidate it with updateTag() right after a write.
 * Errors are thrown (never cached) so a transient outage can't poison the cache.
 */

const CARD_COLUMNS =
  "id,slug,model_code,category_id,name_vi,name_en,summary_vi,summary_en,featured_image,is_featured";
const NEWS_CARD_COLUMNS = "id,slug,title_vi,title_en,excerpt_vi,excerpt_en,cover_image,published_at";

function fail(scope: string, message: string): never {
  throw new Error(`[data:${scope}] ${message}`);
}

export async function getSettings(): Promise<GeneralSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  const { data, error } = await createPublicClient()
    .from("site_settings")
    .select("value")
    .eq("key", "general")
    .maybeSingle();
  if (error) fail("settings", error.message);
  return { ...defaultSettings, ...((data?.value as Partial<GeneralSettings> | undefined) ?? {}) };
}

export async function getBanners(): Promise<Banner[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("banners");
  const { data, error } = await createPublicClient()
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) fail("banners", error.message);
  return (data ?? []) as unknown as Banner[];
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) fail("categories", error.message);
  return (data ?? []) as unknown as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) fail("category", error.message);
  return (data as unknown as Category) ?? null;
}

export async function getProducts(): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const { data, error } = await createPublicClient()
    .from("products")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) fail("products", error.message);
  return (data ?? []) as unknown as ProductCardData[];
}

export async function getProductsByCategory(categoryId: string): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const { data, error } = await createPublicClient()
    .from("products")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) fail("products-by-category", error.message);
  return (data ?? []) as unknown as ProductCardData[];
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const { data, error } = await createPublicClient()
    .from("products")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);
  if (error) fail("featured", error.message);
  return (data ?? []) as unknown as ProductCardData[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const { data, error } = await createPublicClient()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) fail("product", error.message);
  return (data as unknown as Product) ?? null;
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeId: string,
  limit = 4,
): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  let query = createPublicClient()
    .from("products")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .neq("id", excludeId)
    .order("sort_order", { ascending: true })
    .limit(limit);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) fail("related", error.message);
  return (data ?? []) as unknown as ProductCardData[];
}

export async function getProductSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const { data, error } = await createPublicClient()
    .from("products")
    .select("slug")
    .eq("status", "published")
    .limit(500);
  if (error) fail("product-slugs", error.message);
  return (data ?? []).map((r) => r.slug as string);
}

export async function getCategorySlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("slug")
    .eq("is_active", true);
  if (error) fail("category-slugs", error.message);
  return (data ?? []).map((r) => r.slug as string);
}

export async function searchProducts(term: string): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  const q = escapeLike(term);
  if (!q) return [];
  const pattern = `%${q}%`;
  const { data, error } = await createPublicClient()
    .from("products")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .or(
      [
        `name_vi.ilike.${pattern}`,
        `name_en.ilike.${pattern}`,
        `model_code.ilike.${pattern}`,
        `summary_vi.ilike.${pattern}`,
        `summary_en.ilike.${pattern}`,
      ].join(","),
    )
    .order("sort_order", { ascending: true })
    .limit(60);
  if (error) fail("search", error.message);
  return (data ?? []) as unknown as ProductCardData[];
}

export async function getNews(limit = 50): Promise<NewsCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("news");
  const { data, error } = await createPublicClient()
    .from("news_posts")
    .select(NEWS_CARD_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) fail("news", error.message);
  return (data ?? []) as unknown as NewsCardData[];
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("news");
  const { data, error } = await createPublicClient()
    .from("news_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) fail("news-item", error.message);
  return (data as unknown as NewsPost) ?? null;
}

export async function getNewsSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("news");
  const { data, error } = await createPublicClient()
    .from("news_posts")
    .select("slug")
    .eq("status", "published")
    .limit(500);
  if (error) fail("news-slugs", error.message);
  return (data ?? []).map((r) => r.slug as string);
}

export async function getVideos(): Promise<Video[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("videos");
  const { data, error } = await createPublicClient()
    .from("videos")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) fail("videos", error.message);
  return (data ?? []) as unknown as Video[];
}

/** For sitemap.xml */
export async function getSitemapData() {
  "use cache";
  cacheLife("hours");
  cacheTag("products", "categories", "news");
  const sb = createPublicClient();
  const [products, categories, news] = await Promise.all([
    sb.from("products").select("slug,updated_at").eq("status", "published").limit(1000),
    sb.from("categories").select("slug,updated_at").eq("is_active", true).limit(500),
    sb.from("news_posts").select("slug,updated_at").eq("status", "published").limit(1000),
  ]);
  const err = products.error ?? categories.error ?? news.error;
  if (err) fail("sitemap", err.message);
  type Row = { slug: string; updated_at: string };
  return {
    products: (products.data ?? []) as Row[],
    categories: (categories.data ?? []) as Row[],
    news: (news.data ?? []) as Row[],
  };
}
