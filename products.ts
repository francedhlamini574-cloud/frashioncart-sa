// ============================================================
// FrashionCart S.A. — Products API helpers
// ============================================================
import { supabase } from './client';
import type { StorefrontProduct, TablesInsert, TablesUpdate } from '../types/database.types';

export interface ProductSearchParams {
  query?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popularity' | 'rating';
  limit?: number;
  offset?: number;
}

// Uses the search_products() RPC (full-text + filters + sort, one round trip).
export async function searchProducts(params: ProductSearchParams = {}) {
  const { data, error } = await supabase.rpc('search_products', {
    p_query: params.query ?? null,
    p_category_id: params.categoryId ?? null,
    p_brand_id: params.brandId ?? null,
    p_min_price: params.minPrice ?? null,
    p_max_price: params.maxPrice ?? null,
    p_sort: params.sort ?? 'newest',
    p_limit: params.limit ?? 20,
    p_offset: params.offset ?? 0,
  });
  if (error) throw error;
  return data;
}

// Storefront listing — reads the denormalized view (no N+1 joins client-side).
export async function listStorefrontProducts(page = 1, pageSize = 24): Promise<StorefrontProduct[]> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('product_storefront_view')
    .select('*')
    .order('published_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return data ?? [];
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(*),
      product_variants(*, sizes:size_id(*), colors:color_id(*), inventory(*)),
      brands(name, slug, logo_url),
      seller_profiles(id, store_name, store_slug, average_rating)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;

  // fire-and-forget view count increment; don't block the page render on it
  void supabase.from('products').update({ view_count: (data?.view_count ?? 0) + 1 }).eq('id', data.id);

  return data;
}

export async function getFeaturedProducts(limit = 12) {
  const { data, error } = await supabase
    .from('product_storefront_view')
    .select('*')
    .eq('is_featured', true)
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getTrendingProducts(limit = 12) {
  const { data, error } = await supabase
    .from('trending_products_mv')
    .select('*')
    .order('recent_purchase_count', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ------------------------------------------------------------
// Seller-side product management (RLS restricts writes to owner)
// ------------------------------------------------------------
export async function createProduct(product: TablesInsert<'products'>) {
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(productId: string, updates: TablesUpdate<'products'>) {
  const { data, error } = await supabase.from('products').update(updates).eq('id', productId).select().single();
  if (error) throw error;
  return data;
}

export async function publishProduct(productId: string) {
  return updateProduct(productId, { status: 'published', published_at: new Date().toISOString() });
}

export async function archiveProduct(productId: string) {
  return updateProduct(productId, { status: 'archived' });
}

export async function deleteProduct(productId: string) {
  // Soft delete convention: set deleted_at rather than a hard DELETE
  const { error } = await supabase.from('products').update({ deleted_at: new Date().toISOString() }).eq('id', productId);
  if (error) throw error;
}

export async function listSellerProducts(sellerId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('seller_id', sellerId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addProductImage(image: TablesInsert<'product_images'>) {
  const { data, error } = await supabase.from('product_images').insert(image).select().single();
  if (error) throw error;
  return data;
}

export async function upsertVariant(variant: TablesInsert<'product_variants'>) {
  const { data, error } = await supabase
    .from('product_variants')
    .upsert(variant, { onConflict: 'product_id,size_id,color_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateInventory(variantId: string, quantityAvailable: number) {
  const { data, error } = await supabase
    .from('inventory')
    .update({ quantity_available: quantityAvailable })
    .eq('variant_id', variantId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
