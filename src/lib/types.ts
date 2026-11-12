export type Locale = "vi" | "en";

export type SpecRow = { label_vi: string; label_en: string; value: string };
export type SpecGroup = { title_vi: string; title_en: string; rows: SpecRow[] };

export type Category = {
  id: string;
  slug: string;
  name_vi: string;
  name_en: string;
  description_vi: string | null;
  description_en: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  slug: string;
  model_code: string | null;
  category_id: string | null;
  name_vi: string;
  name_en: string;
  summary_vi: string | null;
  summary_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  features_vi: string[];
  features_en: string[];
  specs: SpecGroup[];
  featured_image: string | null;
  gallery: string[];
  video_url: string | null;
  brochure_url: string | null;
  is_featured: boolean;
  status: "draft" | "published";
  sort_order: number;
  seo_title_vi: string | null;
  seo_title_en: string | null;
  seo_description_vi: string | null;
  seo_description_en: string | null;
  published_at: string | null;
  updated_at: string;
};

/** Lightweight shape used by cards/lists. */
export type ProductCardData = Pick<
  Product,
  | "id"
  | "slug"
  | "model_code"
  | "category_id"
  | "name_vi"
  | "name_en"
  | "summary_vi"
  | "summary_en"
  | "featured_image"
  | "is_featured"
>;

export type NewsPost = {
  id: string;
  slug: string;
  title_vi: string;
  title_en: string;
  excerpt_vi: string | null;
  excerpt_en: string | null;
  content_vi: string;
  content_en: string;
  cover_image: string | null;
  status: "draft" | "published";
  seo_title_vi: string | null;
  seo_title_en: string | null;
  seo_description_vi: string | null;
  seo_description_en: string | null;
  published_at: string | null;
  updated_at: string;
};

export type NewsCardData = Pick<
  NewsPost,
  "id" | "slug" | "title_vi" | "title_en" | "excerpt_vi" | "excerpt_en" | "cover_image" | "published_at"
>;

export type Video = {
  id: string;
  title_vi: string;
  title_en: string;
  video_url: string;
  thumbnail_url: string | null;
  product_id: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Banner = {
  id: string;
  title_vi: string;
  title_en: string;
  subtitle_vi: string | null;
  subtitle_en: string | null;
  button_text_vi: string | null;
  button_text_en: string | null;
  link_url: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type GeneralSettings = {
  company_name_vi: string;
  company_name_en: string;
  tagline_vi: string;
  tagline_en: string;
  email: string;
  phone: string;
  hotline: string;
  whatsapp: string;
  zalo: string;
  address_vi: string;
  address_en: string;
  working_hours_vi: string;
  working_hours_en: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  map_embed_url: string;
  about_vi: string;
  about_en: string;
};

export type InquiryStatus = "new" | "read" | "replied" | "archived";

export type Inquiry = {
  id: string;
  product_id: string | null;
  product_name: string | null;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  message: string;
  locale: Locale;
  status: InquiryStatus;
  created_at: string;
};
