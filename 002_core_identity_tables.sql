-- ============================================================
-- FrashionCart S.A. — Migration 002: Core Identity Tables
-- profiles, seller_profiles, brands, addresses
-- ============================================================

-- profiles: 1:1 extension of auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  avatar_url text,
  role user_role not null default 'customer',
  is_active boolean not null default true,
  email_verified boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.profiles is 'One row per auth.users user. Holds role + profile metadata.';

-- seller_profiles: extends a profile when role = seller
create table public.seller_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  store_name text not null,
  store_slug text not null unique,
  store_description text,
  store_logo_url text,
  store_banner_url text,
  business_registration_number text,
  vat_number text,
  business_email text,
  business_phone text,
  bank_account_holder text,
  bank_name text,
  bank_account_number text,
  bank_branch_code text,
  status seller_status not null default 'pending',
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  rejection_reason text,
  commission_rate numeric(5,2) not null default 15.00 check (commission_rate >= 0 and commission_rate <= 100),
  average_rating numeric(3,2) not null default 0 check (average_rating >= 0 and average_rating <= 5),
  total_reviews integer not null default 0,
  total_sales numeric(14,2) not null default 0,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  country_of_origin text default 'South Africa',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type address_type not null default 'shipping',
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  suburb text,
  city text not null,
  province text not null,
  postal_code text not null,
  country text not null default 'South Africa',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
