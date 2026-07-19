// ============================================================
// FrashionCart S.A. — Orders API helpers
// ============================================================
import { supabase } from './client';
import type { OrderStatus } from '../types/database.types';

export async function getCustomerOrders(customerId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, slug, product_images(url, is_primary)))')
    .eq('customer_id', customerId)
    .order('placed_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Seller order queue: their line items across all orders, newest first.
export async function getSellerOrderItems(sellerId: string, status?: OrderStatus) {
  let query = supabase
    .from('order_items')
    .select('*, orders(order_number, placed_at, shipping_addresses(*))')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Seller updates fulfillment status of their own line item (RLS-enforced).
export async function updateOrderItemStatus(orderItemId: string, status: OrderStatus) {
  const { data, error } = await supabase
    .from('order_items')
    .update({ status })
    .eq('id', orderItemId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addTrackingInfo(orderItemId: string, carrier: string, trackingNumber: string) {
  const { data, error } = await supabase
    .from('delivery_tracking')
    .upsert({ order_item_id: orderItemId, carrier, tracking_number: trackingNumber, status: 'shipped', shipped_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function requestReturn(orderItemId: string, customerId: string, reason: string) {
  const { data, error } = await supabase
    .from('returns')
    .insert({ order_item_id: orderItemId, customer_id: customerId, reason })
    .select()
    .single();
  if (error) throw error;
  return data;
}
