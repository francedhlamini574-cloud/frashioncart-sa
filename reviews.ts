// ============================================================
// FrashionCart S.A. — Reviews & Notifications API helpers
// ============================================================
import { supabase } from './client';
import type { TablesInsert } from '../types/database.types';

export async function submitReview(review: TablesInsert<'reviews'>) {
  const { data, error } = await supabase.from('reviews').insert(review).select().single();
  if (error) throw error;
  // product.average_rating / total_reviews are recalculated automatically
  // by the refresh_product_rating trigger — no client-side aggregation needed.
  return data;
}

export async function getProductReviews(productId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('product_id', productId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data ?? [];
}

export async function rateSeller(rating: TablesInsert<'ratings'>) {
  const { data, error } = await supabase.from('ratings').insert(rating).select().single();
  if (error) throw error;
  return data;
}

// ------------------------------------------------------------
// Notifications
// ------------------------------------------------------------
export async function getNotifications(profileId: string, unreadOnly = false) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (unreadOnly) query = query.eq('is_read', false);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);
  if (error) throw error;
}

export function subscribeToNotifications(profileId: string, onNotification: (n: unknown) => void) {
  return supabase
    .channel(`notifications:${profileId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${profileId}` },
      (payload) => onNotification(payload.new)
    )
    .subscribe();
}
