-- ============================================================
-- FrashionCart S.A. — Migration 008: RLS Enablement + Helpers
-- ============================================================

-- ------------------------------------------------------------
-- Helper functions used inside policies (avoid recursive RLS
-- lookups by using SECURITY DEFINER + STABLE)
-- ------------------------------------------------------------
create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role in ('admin', 'super_admin') from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'super_admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.owns_seller_profile(p_seller_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.seller_profiles sp
    where sp.id = p_seller_id and sp.profile_id = auth.uid()
  );
$$;

create or replace function public.current_seller_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.seller_profiles where profile_id = auth.uid();
$$;

-- ------------------------------------------------------------
-- Enable RLS on every table
-- ------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','seller_profiles','brands','addresses','categories','subcategories',
    'collections','sizes','colors','products','product_images','product_variants',
    'inventory','wishlists','wishlist_items','favorites','recently_viewed',
    'shopping_carts','cart_items','discount_campaigns','coupon_codes','orders',
    'order_items','payments','transactions','commissions','seller_payouts',
    'shipping_addresses','delivery_tracking','returns','refunds','reviews','ratings',
    'notifications','support_tickets','analytics_events','audit_logs','reports',
    'system_settings'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;
