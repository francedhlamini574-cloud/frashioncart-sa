-- ============================================================
-- FrashionCart S.A. — Migration 010: Storage Buckets & Policies
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images',     'product-images',     true,  5242880,  array['image/jpeg','image/png','image/webp']),
  ('brand-logos',        'brand-logos',         true,  2097152,  array['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('profile-images',     'profile-images',      true,  2097152,  array['image/jpeg','image/png','image/webp']),
  ('seller-documents',   'seller-documents',    false, 10485760, array['application/pdf','image/jpeg','image/png']),
  ('marketing-banners',  'marketing-banners',   true,  5242880,  array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Convention: object path prefix = owner's id, e.g. product-images/{seller_id}/{product_id}/{file}.jpg
-- This lets policies check ownership via storage.foldername(name)[1] without extra joins.

-- ------------------------------------------------------------
-- product-images: public read, seller writes only within own folder
-- ------------------------------------------------------------
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product_images_seller_upload" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and public.owns_seller_profile((storage.foldername(name))[1]::uuid)
  );

create policy "product_images_seller_manage" on storage.objects
  for update using (
    bucket_id = 'product-images'
    and public.owns_seller_profile((storage.foldername(name))[1]::uuid)
  );

create policy "product_images_seller_delete" on storage.objects
  for delete using (
    bucket_id = 'product-images'
    and (public.owns_seller_profile((storage.foldername(name))[1]::uuid) or public.is_admin())
  );

-- ------------------------------------------------------------
-- brand-logos: public read, owning seller writes
-- ------------------------------------------------------------
create policy "brand_logos_public_read" on storage.objects
  for select using (bucket_id = 'brand-logos');

create policy "brand_logos_seller_write" on storage.objects
  for insert with check (
    bucket_id = 'brand-logos'
    and public.owns_seller_profile((storage.foldername(name))[1]::uuid)
  );

create policy "brand_logos_seller_update" on storage.objects
  for update using (
    bucket_id = 'brand-logos'
    and public.owns_seller_profile((storage.foldername(name))[1]::uuid)
  );

-- ------------------------------------------------------------
-- profile-images: public read, user writes only their own folder
-- ------------------------------------------------------------
create policy "profile_images_public_read" on storage.objects
  for select using (bucket_id = 'profile-images');

create policy "profile_images_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "profile_images_owner_update" on storage.objects
  for update using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ------------------------------------------------------------
-- seller-documents: PRIVATE. Only the owning seller and admins may read/write.
-- (business registration, banking proof, ID documents — sensitive)
-- ------------------------------------------------------------
create policy "seller_docs_owner_read" on storage.objects
  for select using (
    bucket_id = 'seller-documents'
    and (public.owns_seller_profile((storage.foldername(name))[1]::uuid) or public.is_admin())
  );

create policy "seller_docs_owner_upload" on storage.objects
  for insert with check (
    bucket_id = 'seller-documents'
    and public.owns_seller_profile((storage.foldername(name))[1]::uuid)
  );

create policy "seller_docs_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'seller-documents'
    and (public.owns_seller_profile((storage.foldername(name))[1]::uuid) or public.is_admin())
  );

-- ------------------------------------------------------------
-- marketing-banners: public read, admin-only write (platform-level campaigns)
-- ------------------------------------------------------------
create policy "banners_public_read" on storage.objects
  for select using (bucket_id = 'marketing-banners');

create policy "banners_admin_write" on storage.objects
  for all using (bucket_id = 'marketing-banners' and public.is_admin())
  with check (bucket_id = 'marketing-banners' and public.is_admin());
