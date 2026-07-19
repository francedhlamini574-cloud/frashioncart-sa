// ============================================================
// FrashionCart S.A. — Wishlist API helpers
// ============================================================
import { supabase } from './client';

async function getOrCreateDefaultWishlist(profileId: string) {
  const { data: existing, error } = await supabase
    .from('wishlists')
    .select('*')
    .eq('profile_id', profileId)
    .eq('is_default', true)
    .maybeSingle();
  if (error) throw error;
  if (existing) return existing;

  const { data: created, error: createErr } = await supabase
    .from('wishlists')
    .insert({ profile_id: profileId, name: 'My Wishlist', is_default: true })
    .select()
    .single();
  if (createErr) throw createErr;
  return created;
}

export async function addToWishlist(profileId: string, productId: string, variantId?: string) {
  const wishlist = await getOrCreateDefaultWishlist(profileId);
  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({ wishlist_id: wishlist.id, product_id: productId, variant_id: variantId ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFromWishlist(wishlistItemId: string) {
  const { error } = await supabase.from('wishlist_items').delete().eq('id', wishlistItemId);
  if (error) throw error;
}

export async function getWishlist(profileId: string) {
  const wishlist = await getOrCreateDefaultWishlist(profileId);
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*, products(id, name, slug, base_price, sale_price, product_images(url, is_primary))')
    .eq('wishlist_id', wishlist.id)
    .order('added_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function toggleFavorite(profileId: string, productId: string) {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('profile_id', profileId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    return { favorited: false };
  }

  await supabase.from('favorites').insert({ profile_id: profileId, product_id: productId });
  return { favorited: true };
}

export async function recordRecentlyViewed(profileId: string, productId: string) {
  const { error } = await supabase
    .from('recently_viewed')
    .upsert({ profile_id: profileId, product_id: productId, viewed_at: new Date().toISOString() }, { onConflict: 'profile_id,product_id' });
  if (error) throw error;
}
