// ============================================================
// FrashionCart S.A. — Checkout API helpers
// The heavy lifting (subtotal calc, commission split, inventory
// deduction, coupon validation) all happens atomically inside the
// create_order() Postgres function — see migration 007.
// ============================================================
import { supabase } from './client';

export interface CheckoutParams {
  customerId: string;
  cartId: string;
  shippingAddressId: string;
  billingAddressId: string;
  couponCode?: string;
}

// Step 1: create the order record (status: pending) before payment.
export async function createOrderFromCart(params: CheckoutParams): Promise<string> {
  const { data, error } = await supabase.rpc('create_order', {
    p_customer_id: params.customerId,
    p_cart_id: params.cartId,
    p_shipping_address_id: params.shippingAddressId,
    p_billing_address_id: params.billingAddressId,
    p_coupon_code: params.couponCode ?? null,
  });
  if (error) throw error;
  return data as unknown as string; // order id
}

// Step 2: hand off to a payment provider. The actual payment record + status
// transition to 'confirmed' happens server-side in the `verify-payment`
// Edge Function (see supabase/functions/payment-verify), which is invoked
// by the provider's webhook — never trust a client-reported "payment succeeded".
export async function initiatePayment(orderId: string, provider: 'payfast' | 'yoco' | 'stripe' | 'paypal') {
  const { data, error } = await supabase.functions.invoke('checkout', {
    body: { orderId, provider },
  });
  if (error) throw error;
  return data as { redirectUrl: string };
}

export async function getOrderSummary(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*, products(name, slug), product_variants(sku)),
      payments(*),
      shipping_addresses(*)
    `)
    .eq('id', orderId)
    .single();
  if (error) throw error;
  return data;
}
