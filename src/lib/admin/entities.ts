/**
 * Declarative description of every admin-editable entity. The generic list, form and
 * Server Actions are driven from this file — add a field here and it shows up in the UI,
 * gets validated, and is written to the database.
 */

export type FieldType =
  | "text"
  | "url"
  | "textarea"
  | "markdown"
  | "lines" // one array item per line
  | "number"
  | "checkbox"
  | "datetime"
  | "slug"
  | "select"
  | "image"
  | "file"
  | "images"
  | "specs";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  /** Render at half width (pairs Vietnamese / English side by side). */
  half?: boolean;
  /** Section heading rendered above this field. */
  section?: string;
  options?: { value: string; label: string }[];
  optionsFrom?: "categories" | "products";
  /** Store "" instead of NULL when left blank (for NOT NULL text columns). */
  blank?: "" | null;
  max?: number;
};

export type ListColumn = {
  key: string;
  label: string;
  kind?: "text" | "image" | "bool" | "status" | "datetime" | "number" | "ref-categories";
};

export type EntityConfig = {
  key: string;
  table: string;
  title: string;
  singular: string;
  /** Cache tags to invalidate after a write. */
  tags: string[];
  /** Fields to derive a blank slug from (first non-empty wins). */
  slugFrom?: string[];
  /** Column set to `now()` the first time status becomes 'published'. */
  publishedAtField?: string;
  searchColumns?: string[];
  orderBy: { column: string; ascending: boolean }[];
  listColumns: ListColumn[];
  fields: FieldDef[];
  defaults?: Record<string, unknown>;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Bản nháp" },
  { value: "published", label: "Đã xuất bản" },
];

export const entities: Record<string, EntityConfig> = {
  categories: {
    key: "categories",
    table: "categories",
    title: "Danh mục",
    singular: "danh mục",
    tags: ["categories", "products"],
    slugFrom: ["name_en", "name_vi"],
    searchColumns: ["name_vi", "name_en", "slug"],
    orderBy: [{ column: "sort_order", ascending: true }],
    listColumns: [
      { key: "name_vi", label: "Tên (VI)" },
      { key: "name_en", label: "Tên (EN)" },
      { key: "slug", label: "Slug" },
      { key: "sort_order", label: "Thứ tự", kind: "number" },
      { key: "is_active", label: "Hiển thị", kind: "bool" },
    ],
    defaults: { is_active: true, sort_order: 0 },
    fields: [
      { name: "name_vi", label: "Tên (Tiếng Việt)", type: "text", required: true, half: true, max: 200 },
      { name: "name_en", label: "Name (English)", type: "text", required: true, half: true, max: 200 },
      { name: "slug", label: "Slug (URL)", type: "slug", help: "Chữ thường, số và dấu gạch ngang. Để trống để tự tạo." },
      { name: "description_vi", label: "Mô tả (VI)", type: "textarea", half: true, max: 500 },
      { name: "description_en", label: "Description (EN)", type: "textarea", half: true, max: 500 },
      { name: "image_url", label: "Ảnh đại diện", type: "image" },
      { name: "sort_order", label: "Thứ tự hiển thị", type: "number", half: true, help: "Số nhỏ hiển thị trước." },
      { name: "is_active", label: "Hiển thị trên website", type: "checkbox", half: true },
    ],
  },

  products: {
    key: "products",
    table: "products",
    title: "Sản phẩm",
    singular: "sản phẩm",
    tags: ["products"],
    slugFrom: ["name_en", "name_vi"],
    publishedAtField: "published_at",
    searchColumns: ["name_vi", "name_en", "model_code", "slug"],
    orderBy: [
      { column: "sort_order", ascending: true },
      { column: "created_at", ascending: false },
    ],
    listColumns: [
      { key: "featured_image", label: "Ảnh", kind: "image" },
      { key: "model_code", label: "Mã máy" },
      { key: "name_vi", label: "Tên (VI)" },
      { key: "category_id", label: "Danh mục", kind: "ref-categories" },
      { key: "status", label: "Trạng thái", kind: "status" },
      { key: "is_featured", label: "Nổi bật", kind: "bool" },
    ],
    defaults: { status: "draft", is_featured: false, sort_order: 0 },
    fields: [
      { name: "name_vi", label: "Tên (Tiếng Việt)", type: "text", required: true, half: true, max: 300, section: "Thông tin chính" },
      { name: "name_en", label: "Name (English)", type: "text", required: true, half: true, max: 300 },
      { name: "model_code", label: "Mã máy / Model", type: "text", half: true, max: 100 },
      { name: "category_id", label: "Danh mục", type: "select", optionsFrom: "categories", half: true },
      { name: "slug", label: "Slug (URL)", type: "slug", help: "Để trống để tự tạo từ tên." },
      { name: "summary_vi", label: "Tóm tắt (VI)", type: "textarea", half: true, max: 600 },
      { name: "summary_en", label: "Summary (EN)", type: "textarea", half: true, max: 600 },

      { name: "featured_image", label: "Ảnh chính", type: "image", section: "Hình ảnh & tệp" },
      { name: "gallery", label: "Thư viện ảnh", type: "images" },
      { name: "video_url", label: "Video (YouTube hoặc .mp4)", type: "url", half: true },
      { name: "brochure_url", label: "Catalogue (PDF)", type: "file", half: true },

      { name: "description_vi", label: "Mô tả (VI) — Markdown", type: "markdown", half: true, section: "Mô tả chi tiết" },
      { name: "description_en", label: "Description (EN) — Markdown", type: "markdown", half: true },

      { name: "features_vi", label: "Đặc điểm kỹ thuật (VI)", type: "lines", half: true, help: "Mỗi dòng là một đặc điểm.", section: "Đặc điểm kỹ thuật" },
      { name: "features_en", label: "Technical characteristics (EN)", type: "lines", half: true, help: "One item per line." },

      { name: "specs", label: "Bảng thông số kỹ thuật", type: "specs", section: "Thông số kỹ thuật" },

      { name: "status", label: "Trạng thái", type: "select", options: STATUS_OPTIONS, half: true, section: "Hiển thị" },
      { name: "sort_order", label: "Thứ tự hiển thị", type: "number", half: true, help: "Số nhỏ hiển thị trước." },
      { name: "is_featured", label: "Sản phẩm nổi bật (hiện ở trang chủ)", type: "checkbox" },

      { name: "seo_title_vi", label: "SEO title (VI)", type: "text", half: true, max: 120, section: "SEO (tuỳ chọn)" },
      { name: "seo_title_en", label: "SEO title (EN)", type: "text", half: true, max: 120 },
      { name: "seo_description_vi", label: "SEO description (VI)", type: "textarea", half: true, max: 300 },
      { name: "seo_description_en", label: "SEO description (EN)", type: "textarea", half: true, max: 300 },
    ],
  },

  news: {
    key: "news",
    table: "news_posts",
    title: "Tin tức",
    singular: "bài viết",
    tags: ["news"],
    slugFrom: ["title_en", "title_vi"],
    publishedAtField: "published_at",
    searchColumns: ["title_vi", "title_en", "slug"],
    orderBy: [{ column: "published_at", ascending: false }],
    listColumns: [
      { key: "cover_image", label: "Ảnh", kind: "image" },
      { key: "title_vi", label: "Tiêu đề (VI)" },
      { key: "status", label: "Trạng thái", kind: "status" },
      { key: "published_at", label: "Ngày đăng", kind: "datetime" },
    ],
    defaults: { status: "draft" },
    fields: [
      { name: "title_vi", label: "Tiêu đề (Tiếng Việt)", type: "text", required: true, half: true, max: 300, section: "Nội dung" },
      { name: "title_en", label: "Title (English)", type: "text", required: true, half: true, max: 300 },
      { name: "slug", label: "Slug (URL)", type: "slug", help: "Để trống để tự tạo từ tiêu đề." },
      { name: "excerpt_vi", label: "Tóm tắt (VI)", type: "textarea", half: true, max: 500 },
      { name: "excerpt_en", label: "Excerpt (EN)", type: "textarea", half: true, max: 500 },
      { name: "content_vi", label: "Nội dung (VI) — Markdown", type: "markdown", half: true, blank: "" },
      { name: "content_en", label: "Content (EN) — Markdown", type: "markdown", half: true, blank: "" },
      { name: "cover_image", label: "Ảnh bìa", type: "image" },

      { name: "status", label: "Trạng thái", type: "select", options: STATUS_OPTIONS, half: true, section: "Xuất bản" },
      { name: "published_at", label: "Ngày đăng (giờ VN)", type: "datetime", half: true, help: "Để trống = thời điểm xuất bản." },

      { name: "seo_title_vi", label: "SEO title (VI)", type: "text", half: true, max: 120, section: "SEO (tuỳ chọn)" },
      { name: "seo_title_en", label: "SEO title (EN)", type: "text", half: true, max: 120 },
      { name: "seo_description_vi", label: "SEO description (VI)", type: "textarea", half: true, max: 300 },
      { name: "seo_description_en", label: "SEO description (EN)", type: "textarea", half: true, max: 300 },
    ],
  },

  banners: {
    key: "banners",
    table: "banners",
    title: "Banner trang chủ",
    singular: "banner",
    tags: ["banners"],
    orderBy: [{ column: "sort_order", ascending: true }],
    listColumns: [
      { key: "image_url", label: "Ảnh", kind: "image" },
      { key: "title_vi", label: "Tiêu đề (VI)" },
      { key: "link_url", label: "Liên kết" },
      { key: "sort_order", label: "Thứ tự", kind: "number" },
      { key: "is_active", label: "Hiển thị", kind: "bool" },
    ],
    defaults: { is_active: true, sort_order: 0 },
    fields: [
      { name: "title_vi", label: "Tiêu đề (Tiếng Việt)", type: "text", required: true, half: true, max: 200 },
      { name: "title_en", label: "Title (English)", type: "text", required: true, half: true, max: 200 },
      { name: "subtitle_vi", label: "Phụ đề (VI)", type: "textarea", half: true, max: 300 },
      { name: "subtitle_en", label: "Subtitle (EN)", type: "textarea", half: true, max: 300 },
      { name: "button_text_vi", label: "Chữ nút (VI)", type: "text", half: true, max: 60 },
      { name: "button_text_en", label: "Button text (EN)", type: "text", half: true, max: 60 },
      { name: "link_url", label: "Liên kết", type: "text", help: "Đường dẫn nội bộ như /products hoặc /contact, hoặc URL đầy đủ.", max: 500 },
      { name: "image_url", label: "Ảnh nền", type: "image", help: "Khuyến nghị 1920×700. Để trống sẽ dùng nền gradient." },
      { name: "sort_order", label: "Thứ tự hiển thị", type: "number", half: true },
      { name: "is_active", label: "Hiển thị trên website", type: "checkbox", half: true },
    ],
  },

  videos: {
    key: "videos",
    table: "videos",
    title: "Video",
    singular: "video",
    tags: ["videos"],
    orderBy: [{ column: "sort_order", ascending: true }],
    listColumns: [
      { key: "thumbnail_url", label: "Ảnh", kind: "image" },
      { key: "title_vi", label: "Tiêu đề (VI)" },
      { key: "video_url", label: "URL" },
      { key: "sort_order", label: "Thứ tự", kind: "number" },
      { key: "is_active", label: "Hiển thị", kind: "bool" },
    ],
    defaults: { is_active: true, sort_order: 0 },
    fields: [
      { name: "title_vi", label: "Tiêu đề (Tiếng Việt)", type: "text", required: true, half: true, max: 300 },
      { name: "title_en", label: "Title (English)", type: "text", required: true, half: true, max: 300 },
      { name: "video_url", label: "Video URL (YouTube hoặc .mp4)", type: "url", required: true },
      { name: "thumbnail_url", label: "Ảnh xem trước (tuỳ chọn)", type: "image", help: "Với YouTube, ảnh được lấy tự động nếu để trống." },
      { name: "product_id", label: "Sản phẩm liên quan (tuỳ chọn)", type: "select", optionsFrom: "products" },
      { name: "sort_order", label: "Thứ tự hiển thị", type: "number", half: true },
      { name: "is_active", label: "Hiển thị trên website", type: "checkbox", half: true },
    ],
  },
};

/** Company / contact info stored as one JSON row (site_settings.key = 'general'). */
export const settingsFields: FieldDef[] = [
  { name: "company_name_vi", label: "Tên công ty (VI)", type: "text", required: true, half: true, max: 200, section: "Thương hiệu" },
  { name: "company_name_en", label: "Company name (EN)", type: "text", required: true, half: true, max: 200 },
  { name: "tagline_vi", label: "Khẩu hiệu (VI)", type: "text", half: true, max: 200 },
  { name: "tagline_en", label: "Tagline (EN)", type: "text", half: true, max: 200 },

  { name: "email", label: "Email liên hệ", type: "text", half: true, max: 254, section: "Liên hệ" },
  { name: "phone", label: "Điện thoại", type: "text", half: true, max: 50 },
  { name: "hotline", label: "Hotline", type: "text", half: true, max: 50 },
  { name: "whatsapp", label: "WhatsApp (số quốc tế)", type: "text", half: true, max: 50 },
  { name: "zalo", label: "Zalo (số điện thoại)", type: "text", half: true, max: 50 },
  { name: "address_vi", label: "Địa chỉ (VI)", type: "textarea", half: true, max: 400 },
  { name: "address_en", label: "Address (EN)", type: "textarea", half: true, max: 400 },
  { name: "working_hours_vi", label: "Giờ làm việc (VI)", type: "text", half: true, max: 200 },
  { name: "working_hours_en", label: "Working hours (EN)", type: "text", half: true, max: 200 },
  { name: "map_embed_url", label: "Google Maps embed URL", type: "url", help: "Dạng https://www.google.com/maps/embed?pb=… (Chia sẻ → Nhúng bản đồ → lấy giá trị src).", max: 1000 },

  { name: "facebook", label: "Facebook URL", type: "url", half: true, section: "Mạng xã hội" },
  { name: "youtube", label: "YouTube URL", type: "url", half: true },
  { name: "linkedin", label: "LinkedIn URL", type: "url", half: true },

  { name: "about_vi", label: "Giới thiệu (VI) — Markdown", type: "markdown", half: true, blank: "", section: "Trang Giới thiệu" },
  { name: "about_en", label: "About (EN) — Markdown", type: "markdown", half: true, blank: "" },
];

export function getEntity(key: string): EntityConfig | null {
  return Object.prototype.hasOwnProperty.call(entities, key) ? entities[key] : null;
}
