-- ============================================================
-- FrashionCart S.A. — Migration 007: Functions & Triggers
-- ============================================================

-- ------------------------------------------------------------
-- 1. Generic updated_at trigger
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','seller_profiles','brands','addresses','categories','subcategories',
    'collections','products','product_variants','shopping_carts','orders','payments',
    'seller_payouts','delivery_tracking','reviews','support_tickets','wishlists'
  ]
  loop
    execute format(
      'create trigger trg_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t
    );
  end loop;
end $$;

-- ------------------------------------------------------------
-- 2. Product full-text search vector
-- ------------------------------------------------------------
create or replace function public.products_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.tags, '{}'), ' ')), 'C');
  return new;
end;
$$;

create trigger trg_products_search_vector
before insert or update of name, description, tags on public.products
for each row execute function public.products_search_vector_update();

-- ------------------------------------------------------------
-- 3. Auto-generate order_number
-- ------------------------------------------------------------
create or replace function public.generate_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := 'FC-' || to_char(now(), 'YYYYMMDD') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  end if;
  return new;
end;
$$;

create trigger trg_generate_order_number
before insert on public.orders
for each row execute function public.generate_order_number();

-- ------------------------------------------------------------
-- 4. Stock management: reserve on order_item insert, release on cancel
-- ------------------------------------------------------------
create or replace function public.deduct_inventory_on_order_item()
returns trigger
language plpgsql
as $$
begin
  update public.inventory
  set quantity_available = quantity_available - new.quantity,
      quantity_reserved = quantity_reserved + new.quantity,
      updated_at = now()
  where variant_id = new.variant_id;

  if not found then
    raise exception 'No inventory row for variant %', new.variant_id;
  end if;

  if (select quantity_available from public.inventory where variant_id = new.variant_id) < 0 then
    raise exception 'Insufficient stock for variant %', new.variant_id;
  end if;

  return new;
end;
$$;

create trigger trg_deduct_inventory
after insert on public.order_items
for each row execute function public.deduct_inventory_on_order_item();

create or replace function public.release_inventory_on_cancel()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.inventory
    set quantity_available = quantity_available + new.quantity,
        quantity_reserved = greatest(quantity_reserved - new.quantity, 0),
        updated_at = now()
    where variant_id = new.variant_id;
  end if;
  return new;
end;
$$;

create trigger trg_release_inventory
after update of status on public.order_items
for each row execute function public.release_inventory_on_cancel();

-- ------------------------------------------------------------
-- 5. Commission calculation on order_item insert
-- ------------------------------------------------------------
create or replace function public.calculate_commission_on_order_item()
returns trigger
language plpgsql
as $$
declare
  v_commission_amount numeric(12,2);
begin
  v_commission_amount := round(new.line_total * (new.commission_rate_snapshot / 100.0), 2);

  new.commission_amount := v_commission_amount;
  new.seller_earning := new.line_total - v_commission_amount;

  return new;
end;
$$;

create trigger trg_calculate_commission
before insert on public.order_items
for each row execute function public.calculate_commission_on_order_item();

-- Insert into commissions ledger after the order_item is committed
create or replace function public.record_commission_ledger()
returns trigger
language plpgsql
as $$
begin
  insert into public.commissions (order_item_id, seller_id, rate, amount)
  values (new.id, new.seller_id, new.commission_rate_snapshot, new.commission_amount);
  return new;
end;
$$;

create trigger trg_record_commission_ledger
after insert on public.order_items
for each row execute function public.record_commission_ledger();

-- ------------------------------------------------------------
-- 6. create_order RPC: atomic checkout from a cart
-- Called by the Edge Function after payment is verified (or before,
-- for providers with a redirect-then-confirm flow — see docs).
-- ------------------------------------------------------------
create or replace function public.create_order(
  p_customer_id uuid,
  p_cart_id uuid,
  p_shipping_address_id uuid,
  p_billing_address_id uuid,
  p_coupon_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_item record;
  v_subtotal numeric(14,2) := 0;
  v_discount numeric(12,2) := 0;
  v_coupon public.coupon_codes%rowtype;
  v_seller_commission_rate numeric(5,2);
  v_unit_price numeric(12,2);
  v_line_total numeric(14,2);
begin
  if p_customer_id is null or p_cart_id is null then
    raise exception 'customer_id and cart_id are required';
  end if;

  -- Lock cart items and compute subtotal
  select coalesce(sum(
    coalesce(pv.price_override, p.sale_price, p.base_price) * ci.quantity
  ), 0)
  into v_subtotal
  from public.cart_items ci
  join public.product_variants pv on pv.id = ci.variant_id
  join public.products p on p.id = pv.product_id
  where ci.cart_id = p_cart_id;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  -- Validate coupon if provided
  if p_coupon_code is not null then
    select * into v_coupon from public.coupon_codes
    where code = p_coupon_code and is_active = true
      and (expires_at is null or expires_at > now())
      and (max_uses is null or times_used < max_uses)
      and v_subtotal >= coalesce(min_order_value, 0);

    if found then
      v_discount := case v_coupon.discount_type
        when 'percentage' then round(v_subtotal * (v_coupon.discount_value / 100.0), 2)
        else v_coupon.discount_value
      end;
      update public.coupon_codes set times_used = times_used + 1 where id = v_coupon.id;
    end if;
  end if;

  insert into public.orders (
    customer_id, subtotal, discount_amount, total_amount,
    shipping_address_id, billing_address_id, coupon_id, status
  )
  values (
    p_customer_id, v_subtotal, v_discount, v_subtotal - v_discount,
    p_shipping_address_id, p_billing_address_id,
    v_coupon.id, 'pending'
  )
  returning id into v_order_id;

  -- Fan out cart items into order_items (one per variant; seller derived from product)
  for v_item in
    select ci.variant_id, ci.quantity, p.id as product_id, p.name as product_name,
           p.seller_id, coalesce(pv.price_override, p.sale_price, p.base_price) as unit_price,
           sp.commission_rate
    from public.cart_items ci
    join public.product_variants pv on pv.id = ci.variant_id
    join public.products p on p.id = pv.product_id
    join public.seller_profiles sp on sp.id = p.seller_id
    where ci.cart_id = p_cart_id
  loop
    v_line_total := v_item.unit_price * v_item.quantity;

    insert into public.order_items (
      order_id, seller_id, product_id, variant_id,
      product_name_snapshot, unit_price, quantity, line_total,
      commission_rate_snapshot
    )
    values (
      v_order_id, v_item.seller_id, v_item.product_id, v_item.variant_id,
      v_item.product_name, v_item.unit_price, v_item.quantity, v_line_total,
      v_item.commission_rate
    );
  end loop;

  -- Clear the cart
  delete from public.cart_items where cart_id = p_cart_id;

  return v_order_id;
end;
$$;

-- ------------------------------------------------------------
-- 7. Update product rating aggregates when a review is added
-- ------------------------------------------------------------
create or replace function public.refresh_product_rating()
returns trigger
language plpgsql
as $$
declare
  v_product_id uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
  set average_rating = coalesce((
        select round(avg(r.rating)::numeric, 2)
        from public.reviews r
        where r.product_id = v_product_id and r.deleted_at is null
      ), 0),
      total_reviews = (
        select count(*) from public.reviews r
        where r.product_id = v_product_id and r.deleted_at is null
      )
  where p.id = v_product_id;
  return coalesce(new, old);
end;
$$;

create trigger trg_refresh_product_rating
after insert or update or delete on public.reviews
for each row execute function public.refresh_product_rating();

-- ------------------------------------------------------------
-- 8. Notification helper
-- ------------------------------------------------------------
create or replace function public.send_notification(
  p_profile_id uuid,
  p_type notification_type,
  p_title text,
  p_body text default null,
  p_data jsonb default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.notifications (profile_id, type, title, body, data)
  values (p_profile_id, p_type, p_title, p_body, p_data)
  returning id into v_id;
  return v_id;
end;
$$;

-- Notify seller + customer on order status change
create or replace function public.notify_on_order_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    perform public.send_notification(
      new.customer_id, 'order_update',
      'Order ' || new.order_number || ' is now ' || new.status,
      null,
      jsonb_build_object('order_id', new.id, 'status', new.status)
    );
  end if;
  return new;
end;
$$;

create trigger trg_notify_order_status
after update of status on public.orders
for each row execute function public.notify_on_order_status_change();

-- ------------------------------------------------------------
-- 9. Search ranking helper RPC (used by product search API)
-- ------------------------------------------------------------
create or replace function public.search_products(
  p_query text default null,
  p_category_id uuid default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_brand_id uuid default null,
  p_sort text default 'newest', -- newest | price_asc | price_desc | popularity | rating
  p_limit int default 20,
  p_offset int default 0
)
returns setof public.products
language sql
stable
as $$
  select p.*
  from public.products p
  where p.status = 'published'
    and p.deleted_at is null
    and (p_query is null or p.search_vector @@ plainto_tsquery('english', p_query))
    and (p_category_id is null or p.category_id = p_category_id)
    and (p_brand_id is null or p.brand_id = p_brand_id)
    and (p_min_price is null or coalesce(p.sale_price, p.base_price) >= p_min_price)
    and (p_max_price is null or coalesce(p.sale_price, p.base_price) <= p_max_price)
  order by
    case when p_sort = 'price_asc' then coalesce(p.sale_price, p.base_price) end asc,
    case when p_sort = 'price_desc' then coalesce(p.sale_price, p.base_price) end desc,
    case when p_sort = 'popularity' then p.purchase_count end desc,
    case when p_sort = 'rating' then p.average_rating end desc,
    case when p_sort = 'newest' then p.published_at end desc
  limit p_limit offset p_offset;
$$;

-- ------------------------------------------------------------
-- 10. Payout processing RPC (admin-triggered, batches unpaid commissions)
-- ------------------------------------------------------------
create or replace function public.process_seller_payout(
  p_seller_id uuid,
  p_period_start date,
  p_period_end date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount numeric(14,2);
  v_payout_id uuid;
begin
  select coalesce(sum(oi.seller_earning), 0)
  into v_amount
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.seller_id = p_seller_id
    and o.status = 'delivered'
    and o.placed_at::date between p_period_start and p_period_end
    and not exists (
      select 1 from public.seller_payouts sp
      where sp.seller_id = p_seller_id
        and p_period_start between sp.period_start and sp.period_end
    );

  if v_amount <= 0 then
    raise exception 'No payable earnings for seller % in period % to %', p_seller_id, p_period_start, p_period_end;
  end if;

  insert into public.seller_payouts (seller_id, amount, period_start, period_end, status)
  values (p_seller_id, v_amount, p_period_start, p_period_end, 'pending')
  returning id into v_payout_id;

  perform public.send_notification(
    (select profile_id from public.seller_profiles where id = p_seller_id),
    'payout', 'Payout of R' || v_amount || ' initiated',
    null, jsonb_build_object('payout_id', v_payout_id)
  );

  return v_payout_id;
end;
$$;
