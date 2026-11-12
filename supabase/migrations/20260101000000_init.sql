-- Equipment catalog (pharmaceutical machinery) — initial schema
-- Bilingual (vi/en) public catalog + admin CMS. All writes are admin-only via RLS.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admins (who may write). Filled by the setup script after the auth user exists.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so policies on other tables can consult `admins` without
-- recursing through its own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Categories (flat)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_vi        text not null,
  name_en        text not null,
  description_vi text,
  description_en text,
  image_url      text,
  sort_order     integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Products
--   features_*: jsonb array of strings
--   gallery:    jsonb array of image URLs
--   specs:      jsonb array of groups:
--               [{ "title_vi": "", "title_en": "",
--                  "rows": [{ "label_vi": "", "label_en": "", "value": "" }] }]
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  model_code     text,
  category_id    uuid references public.categories (id) on delete set null,
  name_vi        text not null,
  name_en        text not null,
  summary_vi     text,
  summary_en     text,
  description_vi text,
  description_en text,
  features_vi    jsonb not null default '[]'::jsonb,
  features_en    jsonb not null default '[]'::jsonb,
  specs          jsonb not null default '[]'::jsonb,
  featured_image text,
  gallery        jsonb not null default '[]'::jsonb,
  video_url      text,
  brochure_url   text,
  is_featured    boolean not null default false,
  status         text not null default 'draft' check (status in ('draft', 'published')),
  sort_order     integer not null default 0,
  seo_title_vi        text,
  seo_title_en        text,
  seo_description_vi  text,
  seo_description_en  text,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_status_idx   on public.products (status, sort_order);

-- ---------------------------------------------------------------------------
-- News
-- ---------------------------------------------------------------------------
create table if not exists public.news_posts (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_vi       text not null,
  title_en       text not null,
  excerpt_vi     text,
  excerpt_en     text,
  content_vi     text not null default '',
  content_en     text not null default '',
  cover_image    text,
  status         text not null default 'draft' check (status in ('draft', 'published')),
  seo_title_vi        text,
  seo_title_en        text,
  seo_description_vi  text,
  seo_description_en  text,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists news_status_idx on public.news_posts (status, published_at desc);

-- ---------------------------------------------------------------------------
-- Videos
-- ---------------------------------------------------------------------------
create table if not exists public.videos (
  id            uuid primary key default gen_random_uuid(),
  title_vi      text not null,
  title_en      text not null,
  video_url     text not null,
  thumbnail_url text,
  product_id    uuid references public.products (id) on delete set null,
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Home banners
-- ---------------------------------------------------------------------------
create table if not exists public.banners (
  id             uuid primary key default gen_random_uuid(),
  title_vi       text not null,
  title_en       text not null,
  subtitle_vi    text,
  subtitle_en    text,
  button_text_vi text,
  button_text_en text,
  link_url       text,
  image_url      text,
  sort_order     integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Site settings (key/value). Key 'general' holds company + contact info.
-- Public-readable: never store secrets here.
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Inquiries (contact + product quote requests). Anyone may insert; only admins read.
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid references public.products (id) on delete set null,
  product_name text check (char_length(product_name) <= 300),
  name         text not null check (char_length(name) between 1 and 200),
  company      text check (char_length(company) <= 200),
  email        text not null check (char_length(email) between 3 and 254),
  phone        text check (char_length(phone) <= 50),
  country      text check (char_length(country) <= 100),
  message      text not null check (char_length(message) between 5 and 5000),
  locale       text not null default 'vi' check (locale in ('vi', 'en')),
  status       text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists inquiries_status_idx on public.inquiries (status, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['categories','products','news_posts','videos','banners','site_settings','inquiries']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admins        enable row level security;
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.news_posts    enable row level security;
alter table public.videos        enable row level security;
alter table public.banners       enable row level security;
alter table public.site_settings enable row level security;
alter table public.inquiries     enable row level security;

-- admins: an admin may see the admin list; nobody writes through the API.
drop policy if exists "admins read" on public.admins;
create policy "admins read" on public.admins
  for select to authenticated using ((select public.is_admin()));

-- Public read policies (published / active rows only)
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select to anon, authenticated using (is_active);

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products
  for select to anon, authenticated using (status = 'published');

drop policy if exists "public read news" on public.news_posts;
create policy "public read news" on public.news_posts
  for select to anon, authenticated using (status = 'published');

drop policy if exists "public read videos" on public.videos;
create policy "public read videos" on public.videos
  for select to anon, authenticated using (is_active);

drop policy if exists "public read banners" on public.banners;
create policy "public read banners" on public.banners
  for select to anon, authenticated using (is_active);

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings
  for select to anon, authenticated using (true);

-- Admin full access
do $$
declare t text;
begin
  foreach t in array array['categories','products','news_posts','videos','banners','site_settings','inquiries']
  loop
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I
                    for all to authenticated
                    using ((select public.is_admin()))
                    with check ((select public.is_admin()))', t);
  end loop;
end $$;

-- Inquiries: anyone can submit, as a brand-new row only.
drop policy if exists "public insert inquiries" on public.inquiries;
create policy "public insert inquiries" on public.inquiries
  for insert to anon, authenticated with check (status = 'new');

-- ---------------------------------------------------------------------------
-- Grants (explicit, so the Data API works regardless of default privileges)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.categories, public.products, public.news_posts,
                public.videos, public.banners, public.site_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.news_posts,
                public.videos, public.banners, public.site_settings to authenticated;

grant insert on public.inquiries to anon;
grant select, insert, update, delete on public.inquiries to authenticated;

grant select on public.admins to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: public bucket `media` (images + PDFs). Only admins upload/modify.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 10485760,
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "media admin select" on storage.objects;
create policy "media admin select" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
