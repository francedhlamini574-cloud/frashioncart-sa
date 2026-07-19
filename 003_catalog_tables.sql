-- ============================================================
-- FrashionCart S.A. — Migration 003: Catalog Tables
-- categories, subcategories, collections, sizes, colors,
-- products, product_variants, product_images, inventory
-- ============================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (category_id, slug)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.seller_profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  is_featured boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.sizes (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,       -- e.g. XS, S, M, L, XL, 6, 8, 10
  sort_order integer not null default 0
);

create table public.colors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,        -- e.g. Navy, Gold
  hex_code text not null
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid not null references public.categories(id) on delete restrict,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  collection_id uuid references public.collections(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  material text,
  care_instructions text,
  base_price numeric(12,2) not null check (base_price >= 0),
  sale_price numeric(12,2) check (sale_price is null or sale_price >= 0),
  currency text not null default 'ZAR',
  status product_status not null default 'draft',
  is_featured boolean not null default false,
  is_trending boolean not null default false,
  tags text[] not null default '{}',
  search_vector tsvector,
  view_count integer not null default 0,
  purchase_count integer not null default 0,
  average_rating numeric(3,2) not null default 0 check (average_rating >= 0 and average_rating <= 5),
  total_reviews integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint sale_price_lt_base check (sale_price is null or sale_price <= base_price)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size_id uuid references public.sizes(id) on delete set null,
  color_id uuid references public.colors(id) on delete set null,
  sku text not null unique,
  price_override numeric(12,2) check (price_override is null or price_override >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size_id, color_id)
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null unique references public.product_variants(id) on delete cascade,
  quantity_available integer not null default 0 check (quantity_available >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  low_stock_threshold integer not null default 5,
  updated_at timestamptz not null default now()
);
