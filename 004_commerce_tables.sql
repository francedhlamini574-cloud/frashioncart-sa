-- ============================================================
-- FrashionCart S.A. — Migration 004: Commerce Tables
-- carts, wishlists, orders, payments, commissions, payouts,
-- shipping/tracking, returns, refunds
-- ============================================================

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'My Wishlist',
  is_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (wishlist_id, product_id, variant_id)
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, product_id)
);

create table public.recently_viewed (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (profile_id, product_id)
);

create table public.shopping_carts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.shopping_carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  added_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create table public.discount_campaigns (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.seller_profiles(id) on delete cascade, -- null = platform-wide
  name text not null,
  discount_type discount_type not null,
  discount_value numeric(10,2) not null check (discount_value > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.coupon_codes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.discount_campaigns(id) on delete cascade,
  code text not null unique,
  discount_type discount_type not null,
  discount_value numeric(10,2) not null check (discount_value > 0),
  min_order_value numeric(12,2) default 0,
  max_uses integer,
  times_used integer not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  status order_status not null default 'pending',
  subtotal numeric(14,2) not null check (subtotal >= 0),
  shipping_fee numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(14,2) not null check (total_amount >= 0),
  currency text not null default 'ZAR',
  coupon_id uuid references public.coupon_codes(id),
  shipping_address_id uuid references public.addresses(id),
  billing_address_id uuid references public.addresses(id),
  notes text,
  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- order_items: one row per variant per seller within an order
-- (a single order can span multiple sellers in a marketplace)
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  seller_id uuid not null references public.seller_profiles(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  product_name_snapshot text not null,
  variant_label_snapshot text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(14,2) not null check (line_total >= 0),
  commission_rate_snapshot numeric(5,2) not null,
  commission_amount numeric(12,2) not null default 0,
  seller_earning numeric(12,2) not null default 0,
  status order_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider payment_provider not null,
  provider_reference text,
  status payment_status not null default 'pending',
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'ZAR',
  raw_response jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete set null,
  order_id uuid not null references public.orders(id) on delete cascade,
  type text not null check (type in ('charge', 'refund', 'payout', 'adjustment')),
  amount numeric(14,2) not null,
  currency text not null default 'ZAR',
  description text,
  created_at timestamptz not null default now()
);

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null unique references public.order_items(id) on delete cascade,
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  rate numeric(5,2) not null,
  amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table public.seller_payouts (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  status payout_status not null default 'pending',
  period_start date not null,
  period_end date not null,
  processed_at timestamptz,
  reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  suburb text,
  city text not null,
  province text not null,
  postal_code text not null,
  country text not null default 'South Africa'
);

create table public.delivery_tracking (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  carrier text,
  tracking_number text,
  status text not null default 'pending',
  estimated_delivery date,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.returns (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status return_status not null default 'requested',
  requested_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  return_id uuid references public.returns(id) on delete set null,
  payment_id uuid not null references public.payments(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  reason text,
  status payment_status not null default 'pending',
  processed_at timestamptz,
  created_at timestamptz not null default now()
);
