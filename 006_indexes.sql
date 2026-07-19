-- ============================================================
-- FrashionCart S.A. — Migration 006: Indexes
-- ============================================================

-- Profiles / sellers
create index idx_profiles_role on public.profiles(role) where deleted_at is null;
create index idx_seller_profiles_status on public.seller_profiles(status) where deleted_at is null;
create index idx_seller_profiles_slug on public.seller_profiles(store_slug);

-- Brands / categories
create index idx_brands_seller on public.brands(seller_id) where deleted_at is null;
create index idx_subcategories_category on public.subcategories(category_id) where deleted_at is null;

-- Products: the hot path — filtering & sorting on storefront
create index idx_products_seller on public.products(seller_id) where deleted_at is null;
create index idx_products_category on public.products(category_id) where deleted_at is null;
create index idx_products_subcategory on public.products(subcategory_id) where deleted_at is null;
create index idx_products_brand on public.products(brand_id) where deleted_at is null;
create index idx_products_status_published on public.products(status, published_at desc) where deleted_at is null;
create index idx_products_featured on public.products(is_featured) where is_featured = true and deleted_at is null;
create index idx_products_trending on public.products(is_trending) where is_trending = true and deleted_at is null;
create index idx_products_price on public.products(base_price) where deleted_at is null;
create index idx_products_tags_gin on public.products using gin(tags);
create index idx_products_search_gin on public.products using gin(search_vector);
-- Composite: category + status + price, the classic "browse category, filter price" query
create index idx_products_category_status_price on public.products(category_id, status, base_price) where deleted_at is null;

-- Variants / inventory
create index idx_variants_product on public.product_variants(product_id);
create index idx_variants_size on public.product_variants(size_id);
create index idx_variants_color on public.product_variants(color_id);
create index idx_inventory_low_stock on public.inventory(quantity_available) where quantity_available <= low_stock_threshold;

-- Product images
create index idx_product_images_product on public.product_images(product_id, display_order);

-- Wishlist / cart / favorites
create index idx_wishlist_items_wishlist on public.wishlist_items(wishlist_id);
create index idx_cart_items_cart on public.cart_items(cart_id);
create index idx_favorites_profile on public.favorites(profile_id);
create index idx_recently_viewed_profile on public.recently_viewed(profile_id, viewed_at desc);

-- Orders: seller dashboards & customer order history are the two hot queries
create index idx_orders_customer on public.orders(customer_id, placed_at desc) where deleted_at is null;
create index idx_orders_status on public.orders(status) where deleted_at is null;
create index idx_order_items_order on public.order_items(order_id);
create index idx_order_items_seller on public.order_items(seller_id, created_at desc);
create index idx_order_items_variant on public.order_items(variant_id);

-- Payments / commissions / payouts
create index idx_payments_order on public.payments(order_id);
create index idx_payments_status on public.payments(status);
create index idx_commissions_seller on public.commissions(seller_id, created_at desc);
create index idx_payouts_seller on public.seller_payouts(seller_id, status);

-- Reviews
create index idx_reviews_product on public.reviews(product_id) where deleted_at is null;
create index idx_reviews_customer on public.reviews(customer_id);

-- Notifications: unread-first is the hot query
create index idx_notifications_profile_unread on public.notifications(profile_id, is_read, created_at desc);

-- Support tickets
create index idx_support_tickets_profile on public.support_tickets(profile_id, status);
create index idx_support_tickets_assigned on public.support_tickets(assigned_to) where assigned_to is not null;

-- Analytics / audit (append-only, time-ordered)
create index idx_analytics_events_name_time on public.analytics_events(event_name, created_at desc);
create index idx_analytics_events_profile on public.analytics_events(profile_id, created_at desc);
create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id, created_at desc);

-- Coupons
create index idx_coupon_codes_code on public.coupon_codes(code) where is_active = true;
