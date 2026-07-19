// ============================================================
// FrashionCart S.A. — Cart API helpers
// ============================================================
import { supabase } from './client';

async function getOrCreateCart(profileId: string) {
  const { data: existing, error: fetchErr } = await supabase
    .from('shopping_carts')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (existing) return existing;

  const { data: created, error: createErr } = await supabase
    .from('shopping_carts')
    .insert({ profile_id: profileId })
    .select()
    .single();
  if (createErr) throw createErr;
  return created;
}

export async function addToCart(profileId: string, variantId: string, quantity = 1) {
  const cart = await getOrCreateCart(profileId);

  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cart.id)
    .eq('variant_id', variantId)
    .maybeSingle();

  if (existingItem) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('cart_items')
    .insert({ cart_id: cart.id, variant_id: variantId, quantity })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) return removeCartItem(cartItemId);
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeCartItem(cartItemId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
  if (error) throw error;
}

export async function getCart(profileId: string) {
  const cart = await getOrCreateCart(profileId);
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product_variants(
        *, sizes:size_id(label), colors:color_id(name, hex_code),
        products(id, name, slug, base_price, sale_price, product_images(url, is_primary))
      )
    `)
    .eq('cart_id', cart.id);
  if (error) throw error;
  return { cart, items: data ?? [] };
}
