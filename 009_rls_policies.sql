-- ============================================================
-- FrashionCart S.A. — Migration 009: RLS Policies
-- Convention: customers see/own their own rows, sellers manage
-- their own store's rows, admins get elevated read/write,
-- public catalog data is readable by anyone (incl. anon).
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
  -- prevents self-escalation: role column can't be changed via this policy

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());

-- ------------------------------------------------------------
-- seller_profiles
-- ------------------------------------------------------------
create policy "seller_profiles_select_public_approved" on public.seller_profiles
  for select using (status = 'approved' or profile_id = auth.uid() or public.is_admin());

create policy "seller_profiles_insert_self" on public.seller_profiles
  for insert with check (profile_id = auth.uid());

create policy "seller_profiles_update_own_limited" on public.seller_profiles
  for update using (profile_id = auth.uid())
  with check (
    profile_id = auth.uid()
    and status = (select status from public.seller_profiles where profile_id = auth.uid())
    -- sellers cannot approve themselves or change commission_rate; only admins can
  );

create policy "seller_profiles_update_admin" on public.seller_profiles
  for update using (public.is_admin());

-- ------------------------------------------------------------
-- brands
-- ------------------------------------------------------------
create policy "brands_select_public" on public.brands
  for select using (is_active = true or public.owns_seller_profile(seller_id) or public.is_admin());

create policy "brands_insert_own_store" on public.brands
  for insert with check (public.owns_seller_profile(seller_id));

create policy "brands_update_own_or_admin" on public.brands
  for update using (public.owns_seller_profile(seller_id) or public.is_admin());

create policy "brands_delete_own_or_admin" on public.brands
  for delete using (public.owns_seller_profile(seller_id) or public.is_admin());

-- ------------------------------------------------------------
-- addresses (strictly private to owner)
-- ------------------------------------------------------------
create policy "addresses_all_own" on public.addresses
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "addresses_admin_read" on public.addresses
  for select using (public.is_admin());

-- ------------------------------------------------------------
-- categories / subcategories / collections / sizes / colors
-- Public catalog reference data — readable by everyone, writable by admin only
-- (collections may be seller-owned)
-- ------------------------------------------------------------
create policy "categories_select_all" on public.categories for select using (true);
create policy "categories_write_admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "subcategories_select_all" on public.subcategories for select using (true);
create policy "subcategories_write_admin" on public.subcategories for all using (public.is_admin()) with check (public.is_admin());

create policy "sizes_select_all" on public.sizes for select using (true);
create policy "sizes_write_admin" on public.sizes for all using (public.is_admin()) with check (public.is_admin());

create policy "colors_select_all" on public.colors for select using (true);
create policy "colors_write_admin" on public.colors for all using (public.is_admin()) with check (public.is_admin());

create policy "collections_select_all" on public.collections for select using (true);
create policy "collections_write_own_or_admin" on public.collections
  for all using (seller_id is null and public.is_admin() or public.owns_seller_profile(seller_id) or public.is_admin())
  with check (public.owns_seller_profile(seller_id) or public.is_admin());

-- ------------------------------------------------------------
-- products / product_images / product_variants / inventory
-- ------------------------------------------------------------
create policy "products_select_published_or_own" on public.products
  for select using (
    (status = 'published' and deleted_at is null)
    or public.owns_seller_profile(seller_id)
    or public.is_admin()
  );

create policy "products_insert_own_store" on public.products
  for insert with check (public.owns_seller_profile(seller_id));

create policy "products_update_own_or_admin" on public.products
  for update using (public.owns_seller_profile(seller_id) or public.is_admin());

create policy "products_delete_own_or_admin" on public.products
  for delete using (public.owns_seller_profile(seller_id) or public.is_admin());

create policy "product_images_select_all" on public.product_images
  for select using (
    exists (select 1 from public.products p where p.id = product_id and (p.status = 'published' or public.owns_seller_profile(p.seller_id) or public.is_admin()))
  );

create policy "product_images_write_own" on public.product_images
  for all using (
    exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin()))
  )
  with check (
    exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin()))
  );

create policy "product_variants_select_all" on public.product_variants
  for select using (
    exists (select 1 from public.products p where p.id = product_id and (p.status = 'published' or public.owns_seller_profile(p.seller_id) or public.is_admin()))
  );

create policy "product_variants_write_own" on public.product_variants
  for all using (
    exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin()))
  )
  with check (
    exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin()))
  );

create policy "inventory_select_all" on public.inventory
  for select using (
    exists (
      select 1 from public.product_variants pv join public.products p on p.id = pv.product_id
      where pv.id = variant_id and (p.status = 'published' or public.owns_seller_profile(p.seller_id) or public.is_admin())
    )
  );

create policy "inventory_write_own" on public.inventory
  for all using (
    exists (
      select 1 from public.product_variants pv join public.products p on p.id = pv.product_id
      where pv.id = variant_id and (public.owns_seller_profile(p.seller_id) or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.product_variants pv join public.products p on p.id = pv.product_id
      where pv.id = variant_id and (public.owns_seller_profile(p.seller_id) or public.is_admin())
    )
  );

-- ------------------------------------------------------------
-- wishlists / wishlist_items / favorites / recently_viewed / carts (private)
-- ------------------------------------------------------------
create policy "wishlists_all_own" on public.wishlists for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "wishlist_items_all_own" on public.wishlist_items
  for all using (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.profile_id = auth.uid()))
  with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.profile_id = auth.uid()));

create policy "favorites_all_own" on public.favorites for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "recently_viewed_all_own" on public.recently_viewed for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "carts_all_own" on public.shopping_carts for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "cart_items_all_own" on public.cart_items
  for all using (exists (select 1 from public.shopping_carts c where c.id = cart_id and c.profile_id = auth.uid()))
  with check (exists (select 1 from public.shopping_carts c where c.id = cart_id and c.profile_id = auth.uid()));

-- ------------------------------------------------------------
-- discount_campaigns / coupon_codes
-- ------------------------------------------------------------
create policy "campaigns_select_active" on public.discount_campaigns
  for select using (is_active = true or public.owns_seller_profile(seller_id) or public.is_admin());
create policy "campaigns_write_own_or_admin" on public.discount_campaigns
  for all using (public.owns_seller_profile(seller_id) or public.is_admin())
  with check (public.owns_seller_profile(seller_id) or public.is_admin());

create policy "coupons_select_active" on public.coupon_codes for select using (is_active = true or public.is_admin());
create policy "coupons_write_admin" on public.coupon_codes for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- orders / order_items (customer sees own; seller sees own line items; admin sees all)
-- ------------------------------------------------------------
create policy "orders_select_own_or_admin" on public.orders
  for select using (
    customer_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.order_items oi where oi.order_id = id and public.owns_seller_profile(oi.seller_id))
  );

create policy "orders_insert_own" on public.orders
  for insert with check (customer_id = auth.uid());

create policy "orders_update_admin_only" on public.orders
  for update using (public.is_admin());
  -- status transitions happen via RPCs/Edge Functions running as service role,
  -- or admin; customers/sellers never update orders directly.

create policy "order_items_select_related" on public.order_items
  for select using (
    public.owns_seller_profile(seller_id)
    or public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );

create policy "order_items_update_seller_status" on public.order_items
  for update using (public.owns_seller_profile(seller_id) or public.is_admin())
  with check (public.owns_seller_profile(seller_id) or public.is_admin());
  -- sellers may update fulfillment status of their own line items only

-- order_items INSERT happens only via the create_order() SECURITY DEFINER function,
-- so no direct insert policy is granted to authenticated users.

-- ------------------------------------------------------------
-- payments / transactions / commissions / payouts (financial — tightly scoped)
-- ------------------------------------------------------------
create policy "payments_select_related" on public.payments
  for select using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );
-- writes only via service role (Edge Functions), no client insert/update policy

create policy "transactions_select_related" on public.transactions
  for select using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );

create policy "commissions_select_own_or_admin" on public.commissions
  for select using (public.owns_seller_profile(seller_id) or public.is_admin());

create policy "payouts_select_own_or_admin" on public.seller_payouts
  for select using (public.owns_seller_profile(seller_id) or public.is_admin());
create policy "payouts_write_admin" on public.seller_payouts
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- shipping_addresses / delivery_tracking
-- ------------------------------------------------------------
create policy "shipping_addr_select_related" on public.shipping_addresses
  for select using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
    or exists (select 1 from public.order_items oi where oi.order_id = order_id and public.owns_seller_profile(oi.seller_id))
  );

create policy "delivery_tracking_select_related" on public.delivery_tracking
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.order_items oi join public.orders o on o.id = oi.order_id
      where oi.id = order_item_id and (o.customer_id = auth.uid() or public.owns_seller_profile(oi.seller_id))
    )
  );

create policy "delivery_tracking_write_seller_or_admin" on public.delivery_tracking
  for all using (
    public.is_admin()
    or exists (select 1 from public.order_items oi where oi.id = order_item_id and public.owns_seller_profile(oi.seller_id))
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.order_items oi where oi.id = order_item_id and public.owns_seller_profile(oi.seller_id))
  );

-- ------------------------------------------------------------
-- returns / refunds
-- ------------------------------------------------------------
create policy "returns_select_related" on public.returns
  for select using (
    customer_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.order_items oi where oi.id = order_item_id and public.owns_seller_profile(oi.seller_id))
  );

create policy "returns_insert_own" on public.returns
  for insert with check (customer_id = auth.uid());

create policy "returns_update_admin_or_seller" on public.returns
  for update using (
    public.is_admin()
    or exists (select 1 from public.order_items oi where oi.id = order_item_id and public.owns_seller_profile(oi.seller_id))
  );

create policy "refunds_select_admin" on public.refunds for select using (public.is_admin());
-- refunds are written exclusively via service-role Edge Functions

-- ------------------------------------------------------------
-- reviews / ratings
-- ------------------------------------------------------------
create policy "reviews_select_all" on public.reviews for select using (deleted_at is null or public.is_admin());
create policy "reviews_insert_own" on public.reviews for insert with check (customer_id = auth.uid());
create policy "reviews_update_own_or_admin" on public.reviews for update using (customer_id = auth.uid() or public.is_admin());
create policy "reviews_delete_own_or_admin" on public.reviews for delete using (customer_id = auth.uid() or public.is_admin());

create policy "ratings_select_all" on public.ratings for select using (true);
create policy "ratings_insert_own" on public.ratings for insert with check (customer_id = auth.uid());

-- ------------------------------------------------------------
-- notifications (private)
-- ------------------------------------------------------------
create policy "notifications_select_own" on public.notifications for select using (profile_id = auth.uid());
create policy "notifications_update_own" on public.notifications for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
-- inserts happen via SECURITY DEFINER send_notification() only

-- ------------------------------------------------------------
-- support_tickets
-- ------------------------------------------------------------
create policy "tickets_select_own_or_staff" on public.support_tickets
  for select using (profile_id = auth.uid() or assigned_to = auth.uid() or public.is_admin());
create policy "tickets_insert_own" on public.support_tickets for insert with check (profile_id = auth.uid());
create policy "tickets_update_own_or_staff" on public.support_tickets
  for update using (profile_id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------
-- analytics_events / audit_logs / reports / system_settings (admin-only visibility)
-- ------------------------------------------------------------
create policy "analytics_insert_any_authenticated" on public.analytics_events
  for insert with check (auth.uid() is not null or profile_id is null);
create policy "analytics_select_admin" on public.analytics_events for select using (public.is_admin());

create policy "audit_logs_select_admin" on public.audit_logs for select using (public.is_admin());
-- audit_logs are written exclusively by triggers/service role, never client-writable

create policy "reports_select_admin" on public.reports for select using (public.is_admin());
create policy "reports_write_admin" on public.reports for all using (public.is_admin()) with check (public.is_admin());

create policy "system_settings_select_admin" on public.system_settings for select using (public.is_admin());
create policy "system_settings_write_super_admin" on public.system_settings
  for all using (public.is_super_admin()) with check (public.is_super_admin());
