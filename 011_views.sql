-- ============================================================
-- FrashionCart S.A. — Migration 011: Views & Materialized Views
-- ============================================================

-- Storefront product card view: denormalized for fast list rendering,
-- avoids N+1 lookups for brand/category/primary image/price on every listing.
create or replace view public.product_storefront_view as
select
  p.id,
  p.name,
  p.slug,
  p.base_price,
  p.sale_price,
  p.currency,
  p.average_rating,
  p.total_reviews,
  p.is_featured,
  p.is_trending,
  p.published_at,
  c.name as category_name,
  c.slug as category_slug,
  b.name as brand_name,
  b.slug as brand_slug,
  sp.store_name as seller_store_name,
  sp.id as seller_id,
  (select pi.url from public.product_images pi
     where pi.product_id = p.id order by pi.is_primary desc, pi.display_order asc limit 1) as primary_image_url,
  exists (
    select 1 from public.inventory inv
    join public.product_variants pv on pv.id = inv.variant_id
    where pv.product_id = p.id and inv.quantity_available > 0
  ) as in_stock
from public.products p
join public.categories c on c.id = p.category_id
left join public.brands b on b.id = p.brand_id
join public.seller_profiles sp on sp.id = p.seller_id
where p.status = 'published' and p.deleted_at is null;

-- Seller dashboard summary: sales, order counts, pending payouts at a glance
create or replace view public.seller_dashboard_view as
select
  sp.id as seller_id,
  sp.store_name,
  count(distinct oi.order_id) filter (where o.status = 'delivered') as completed_orders,
  count(distinct oi.order_id) filter (where o.status in ('pending','confirmed','processing','shipped')) as active_orders,
  coalesce(sum(oi.seller_earning) filter (where o.status = 'delivered'), 0) as lifetime_earnings,
  coalesce(sum(oi.seller_earning) filter (
    where o.status = 'delivered'
    and not exists (
      select 1 from public.seller_payouts payout
      where payout.seller_id = sp.id and o.placed_at::date between payout.period_start and payout.period_end
    )
  ), 0) as unpaid_earnings,
  count(distinct p.id) filter (where p.status = 'published') as published_products
from public.seller_profiles sp
left join public.products p on p.seller_id = sp.id and p.deleted_at is null
left join public.order_items oi on oi.seller_id = sp.id
left join public.orders o on o.id = oi.order_id
group by sp.id, sp.store_name;

-- Materialized view: trending products (refreshed periodically via cron / Edge Function)
-- Heavier to compute (windowed purchase velocity), so materialized rather than live.
create materialized view public.trending_products_mv as
select
  p.id,
  p.name,
  p.slug,
  p.base_price,
  p.sale_price,
  p.average_rating,
  count(oi.id) as recent_purchase_count
from public.products p
join public.order_items oi on oi.product_id = p.id
join public.orders o on o.id = oi.order_id
where o.placed_at > now() - interval '14 days'
  and p.status = 'published' and p.deleted_at is null
group by p.id
order by recent_purchase_count desc
limit 100;

create unique index idx_trending_products_mv_id on public.trending_products_mv(id);

-- Refresh helper (call from a scheduled Edge Function / pg_cron)
create or replace function public.refresh_trending_products()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  refresh materialized view concurrently public.trending_products_mv;
end;
$$;
