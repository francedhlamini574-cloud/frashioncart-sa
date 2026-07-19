// ============================================================
// FrashionCart S.A. — Supabase Database Types
// Hand-authored to match migrations 001-011, verified against
// a live Postgres instance (see /docs/VALIDATION.md).
// Regenerate with `supabase gen types typescript` once linked
// to your real project — this file should match 1:1.
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ------------------------------------------------------------
// Enums
// ------------------------------------------------------------
export type UserRole = 'customer' | 'seller' | 'admin' | 'super_admin';
export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ProductStatus = 'draft' | 'published' | 'archived';
export type OrderStatus =
  | 'pending' | 'confirmed' | 'processing' | 'shipped'
  | 'delivered' | 'cancelled' | 'refunded' | 'failed';
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type PaymentProvider = 'payfast' | 'yoco' | 'stripe' | 'paypal' | 'manual';
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'on_hold';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'received' | 'refunded';
export type NotificationType =
  | 'order_update' | 'payment' | 'payout' | 'review' | 'promotion'
  | 'system' | 'seller_approval' | 'stock_alert';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type DiscountType = 'percentage' | 'fixed_amount';
export type AddressType = 'shipping' | 'billing' | 'both';

// ------------------------------------------------------------
// Database interface (Supabase JS v2 shape: Row / Insert / Update)
// ------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          is_active: boolean;
          email_verified: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          email_verified?: boolean;
          last_login_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };

      seller_profiles: {
        Row: {
          id: string;
          profile_id: string;
          store_name: string;
          store_slug: string;
          store_description: string | null;
          store_logo_url: string | null;
          store_banner_url: string | null;
          business_registration_number: string | null;
          vat_number: string | null;
          business_email: string | null;
          business_phone: string | null;
          bank_account_holder: string | null;
          bank_name: string | null;
          bank_account_number: string | null;
          bank_branch_code: string | null;
          status: SellerStatus;
          approved_at: string | null;
          approved_by: string | null;
          rejection_reason: string | null;
          commission_rate: number;
          average_rating: number;
          total_reviews: number;
          total_sales: number;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          store_name: string;
          store_slug: string;
          store_description?: string | null;
          store_logo_url?: string | null;
          store_banner_url?: string | null;
          business_registration_number?: string | null;
          vat_number?: string | null;
          business_email?: string | null;
          business_phone?: string | null;
          bank_account_holder?: string | null;
          bank_name?: string | null;
          bank_account_number?: string | null;
          bank_branch_code?: string | null;
          status?: SellerStatus;
          commission_rate?: number;
        };
        Update: Partial<Database['public']['Tables']['seller_profiles']['Insert']>;
        Relationships: [];
      };

      brands: {
        Row: {
          id: string;
          seller_id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          country_of_origin: string | null;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          seller_id: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          country_of_origin?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['brands']['Insert']>;
        Relationships: [];
      };

      addresses: {
        Row: {
          id: string;
          profile_id: string;
          type: AddressType;
          full_name: string;
          phone: string;
          line1: string;
          line2: string | null;
          suburb: string | null;
          city: string;
          province: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          type?: AddressType;
          full_name: string;
          phone: string;
          line1: string;
          line2?: string | null;
          suburb?: string | null;
          city: string;
          province: string;
          postal_code: string;
          country?: string;
          is_default?: boolean;
        };
        Update: Partial<Database['public']['Tables']['addresses']['Insert']>;
        Relationships: [];
      };

      categories: {
        Row: {
          id: string; name: string; slug: string; description: string | null;
          image_url: string | null; display_order: number; is_active: boolean;
          created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: { id?: string; name: string; slug: string; description?: string | null; image_url?: string | null; display_order?: number; is_active?: boolean; };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
        Relationships: [];
      };

      subcategories: {
        Row: {
          id: string; category_id: string; name: string; slug: string; description: string | null;
          display_order: number; is_active: boolean; created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: { id?: string; category_id: string; name: string; slug: string; description?: string | null; display_order?: number; is_active?: boolean; };
        Update: Partial<Database['public']['Tables']['subcategories']['Insert']>;
        Relationships: [];
      };

      collections: {
        Row: {
          id: string; seller_id: string | null; name: string; slug: string; description: string | null;
          cover_image_url: string | null; is_featured: boolean; starts_at: string | null; ends_at: string | null;
          created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: { id?: string; seller_id?: string | null; name: string; slug: string; description?: string | null; cover_image_url?: string | null; is_featured?: boolean; starts_at?: string | null; ends_at?: string | null; };
        Update: Partial<Database['public']['Tables']['collections']['Insert']>;
        Relationships: [];
      };

      sizes: {
        Row: { id: string; label: string; sort_order: number };
        Insert: { id?: string; label: string; sort_order?: number };
        Update: Partial<Database['public']['Tables']['sizes']['Insert']>;
        Relationships: [];
      };

      colors: {
        Row: { id: string; name: string; hex_code: string };
        Insert: { id?: string; name: string; hex_code: string };
        Update: Partial<Database['public']['Tables']['colors']['Insert']>;
        Relationships: [];
      };

      products: {
        Row: {
          id: string; seller_id: string; brand_id: string | null; category_id: string;
          subcategory_id: string | null; collection_id: string | null;
          name: string; slug: string; description: string | null; material: string | null;
          care_instructions: string | null; base_price: number; sale_price: number | null;
          currency: string; status: ProductStatus; is_featured: boolean; is_trending: boolean;
          tags: string[]; search_vector: unknown | null; view_count: number; purchase_count: number;
          average_rating: number; total_reviews: number; published_at: string | null;
          created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: {
          id?: string; seller_id: string; brand_id?: string | null; category_id: string;
          subcategory_id?: string | null; collection_id?: string | null;
          name: string; slug: string; description?: string | null; material?: string | null;
          care_instructions?: string | null; base_price: number; sale_price?: number | null;
          currency?: string; status?: ProductStatus; is_featured?: boolean; is_trending?: boolean;
          tags?: string[]; published_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
        Relationships: [];
      };

      product_images: {
        Row: { id: string; product_id: string; url: string; alt_text: string | null; display_order: number; is_primary: boolean; created_at: string; };
        Insert: { id?: string; product_id: string; url: string; alt_text?: string | null; display_order?: number; is_primary?: boolean; };
        Update: Partial<Database['public']['Tables']['product_images']['Insert']>;
        Relationships: [];
      };

      product_variants: {
        Row: {
          id: string; product_id: string; size_id: string | null; color_id: string | null;
          sku: string; price_override: number | null; is_active: boolean; created_at: string; updated_at: string;
        };
        Insert: { id?: string; product_id: string; size_id?: string | null; color_id?: string | null; sku: string; price_override?: number | null; is_active?: boolean; };
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>;
        Relationships: [];
      };

      inventory: {
        Row: { id: string; variant_id: string; quantity_available: number; quantity_reserved: number; low_stock_threshold: number; updated_at: string; };
        Insert: { id?: string; variant_id: string; quantity_available?: number; quantity_reserved?: number; low_stock_threshold?: number; };
        Update: Partial<Database['public']['Tables']['inventory']['Insert']>;
        Relationships: [];
      };

      wishlists: {
        Row: { id: string; profile_id: string; name: string; is_default: boolean; created_at: string; updated_at: string; };
        Insert: { id?: string; profile_id: string; name?: string; is_default?: boolean; };
        Update: Partial<Database['public']['Tables']['wishlists']['Insert']>;
        Relationships: [];
      };

      wishlist_items: {
        Row: { id: string; wishlist_id: string; product_id: string; variant_id: string | null; added_at: string; };
        Insert: { id?: string; wishlist_id: string; product_id: string; variant_id?: string | null; };
        Update: Partial<Database['public']['Tables']['wishlist_items']['Insert']>;
        Relationships: [];
      };

      favorites: {
        Row: { id: string; profile_id: string; product_id: string; created_at: string; };
        Insert: { id?: string; profile_id: string; product_id: string; };
        Update: Partial<Database['public']['Tables']['favorites']['Insert']>;
        Relationships: [];
      };

      recently_viewed: {
        Row: { id: string; profile_id: string; product_id: string; viewed_at: string; };
        Insert: { id?: string; profile_id: string; product_id: string; viewed_at?: string; };
        Update: Partial<Database['public']['Tables']['recently_viewed']['Insert']>;
        Relationships: [];
      };

      shopping_carts: {
        Row: { id: string; profile_id: string; created_at: string; updated_at: string; };
        Insert: { id?: string; profile_id: string; };
        Update: Partial<Database['public']['Tables']['shopping_carts']['Insert']>;
        Relationships: [];
      };

      cart_items: {
        Row: { id: string; cart_id: string; variant_id: string; quantity: number; added_at: string; };
        Insert: { id?: string; cart_id: string; variant_id: string; quantity: number; };
        Update: Partial<Database['public']['Tables']['cart_items']['Insert']>;
        Relationships: [];
      };

      discount_campaigns: {
        Row: { id: string; seller_id: string | null; name: string; discount_type: DiscountType; discount_value: number; starts_at: string; ends_at: string; is_active: boolean; created_at: string; };
        Insert: { id?: string; seller_id?: string | null; name: string; discount_type: DiscountType; discount_value: number; starts_at: string; ends_at: string; is_active?: boolean; };
        Update: Partial<Database['public']['Tables']['discount_campaigns']['Insert']>;
        Relationships: [];
      };

      coupon_codes: {
        Row: { id: string; campaign_id: string | null; code: string; discount_type: DiscountType; discount_value: number; min_order_value: number | null; max_uses: number | null; times_used: number; is_active: boolean; expires_at: string | null; created_at: string; };
        Insert: { id?: string; campaign_id?: string | null; code: string; discount_type: DiscountType; discount_value: number; min_order_value?: number | null; max_uses?: number | null; is_active?: boolean; expires_at?: string | null; };
        Update: Partial<Database['public']['Tables']['coupon_codes']['Insert']>;
        Relationships: [];
      };

      orders: {
        Row: {
          id: string; order_number: string; customer_id: string; status: OrderStatus;
          subtotal: number; shipping_fee: number; discount_amount: number; tax_amount: number;
          total_amount: number; currency: string; coupon_id: string | null;
          shipping_address_id: string | null; billing_address_id: string | null; notes: string | null;
          placed_at: string; created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: {
          id?: string; order_number?: string; customer_id: string; status?: OrderStatus;
          subtotal: number; shipping_fee?: number; discount_amount?: number; tax_amount?: number;
          total_amount: number; currency?: string; coupon_id?: string | null;
          shipping_address_id?: string | null; billing_address_id?: string | null; notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
        Relationships: [];
      };

      order_items: {
        Row: {
          id: string; order_id: string; seller_id: string; product_id: string; variant_id: string;
          product_name_snapshot: string; variant_label_snapshot: string | null; unit_price: number;
          quantity: number; line_total: number; commission_rate_snapshot: number; commission_amount: number;
          seller_earning: number; status: OrderStatus; created_at: string;
        };
        // NOTE: in practice this table is only ever written via the create_order()
        // RPC (see migration 007) — RLS grants no direct INSERT policy to
        // authenticated users, so a client .insert() call will fail at the
        // database layer even though the shape below type-checks.
        Insert: {
          id?: string; order_id: string; seller_id: string; product_id: string; variant_id: string;
          product_name_snapshot: string; variant_label_snapshot?: string | null; unit_price: number;
          quantity: number; line_total: number; commission_rate_snapshot: number;
        };
        Update: { status?: OrderStatus };
        Relationships: [];
      };

      payments: {
        Row: { id: string; order_id: string; provider: PaymentProvider; provider_reference: string | null; status: PaymentStatus; amount: number; currency: string; raw_response: Json | null; paid_at: string | null; created_at: string; updated_at: string; };
        // Written exclusively by Edge Functions using the service-role key
        // (see supabase/functions/payment-verify). No client INSERT/UPDATE
        // policy exists in RLS — see migration 009.
        Insert: { id?: string; order_id: string; provider: PaymentProvider; provider_reference?: string | null; status?: PaymentStatus; amount: number; currency?: string; raw_response?: Json | null; paid_at?: string | null; };
        Update: { status?: PaymentStatus; provider_reference?: string | null; raw_response?: Json | null; paid_at?: string | null; };
        Relationships: [];
      };

      transactions: {
        Row: { id: string; payment_id: string | null; order_id: string; type: 'charge' | 'refund' | 'payout' | 'adjustment'; amount: number; currency: string; description: string | null; created_at: string; };
        // Service-role only — see migration 009.
        Insert: { id?: string; payment_id?: string | null; order_id: string; type: 'charge' | 'refund' | 'payout' | 'adjustment'; amount: number; currency?: string; description?: string | null; };
        Update: Record<string, never>; // immutable ledger row
        Relationships: [];
      };

      commissions: {
        Row: { id: string; order_item_id: string; seller_id: string; rate: number; amount: number; created_at: string; };
        // Written automatically by the record_commission_ledger trigger — see migration 007.
        Insert: { id?: string; order_item_id: string; seller_id: string; rate: number; amount: number; };
        Update: Record<string, never>; // immutable ledger row
        Relationships: [];
      };

      seller_payouts: {
        Row: { id: string; seller_id: string; amount: number; status: PayoutStatus; period_start: string; period_end: string; processed_at: string | null; reference: string | null; notes: string | null; created_at: string; updated_at: string; };
        // Created exclusively by the process_seller_payout() RPC — see migration 007.
        Insert: { id?: string; seller_id: string; amount: number; status?: PayoutStatus; period_start: string; period_end: string; reference?: string | null; notes?: string | null; };
        Update: { status?: PayoutStatus; processed_at?: string | null; reference?: string | null; notes?: string | null; };
        Relationships: [];
      };

      shipping_addresses: {
        Row: { id: string; order_id: string; full_name: string; phone: string; line1: string; line2: string | null; suburb: string | null; city: string; province: string; postal_code: string; country: string; };
        Insert: { id?: string; order_id: string; full_name: string; phone: string; line1: string; line2?: string | null; suburb?: string | null; city: string; province: string; postal_code: string; country?: string; };
        Update: Partial<Database['public']['Tables']['shipping_addresses']['Insert']>;
        Relationships: [];
      };

      delivery_tracking: {
        Row: { id: string; order_item_id: string; carrier: string | null; tracking_number: string | null; status: string; estimated_delivery: string | null; shipped_at: string | null; delivered_at: string | null; created_at: string; updated_at: string; };
        Insert: { id?: string; order_item_id: string; carrier?: string | null; tracking_number?: string | null; status?: string; estimated_delivery?: string | null; shipped_at?: string | null; delivered_at?: string | null; };
        Update: Partial<Database['public']['Tables']['delivery_tracking']['Insert']>;
        Relationships: [];
      };

      returns: {
        Row: { id: string; order_item_id: string; customer_id: string; reason: string; status: ReturnStatus; requested_at: string; resolved_at: string | null; };
        Insert: { id?: string; order_item_id: string; customer_id: string; reason: string; status?: ReturnStatus; };
        Update: { status?: ReturnStatus; resolved_at?: string | null };
        Relationships: [];
      };

      refunds: {
        Row: { id: string; return_id: string | null; payment_id: string; amount: number; reason: string | null; status: PaymentStatus; processed_at: string | null; created_at: string; };
        // Service-role only (Edge Functions) — see migration 009.
        Insert: { id?: string; return_id?: string | null; payment_id: string; amount: number; reason?: string | null; status?: PaymentStatus; processed_at?: string | null; };
        Update: { status?: PaymentStatus; processed_at?: string | null; };
        Relationships: [];
      };

      reviews: {
        Row: { id: string; product_id: string; customer_id: string; order_item_id: string | null; rating: number; title: string | null; body: string | null; is_verified_purchase: boolean; helpful_count: number; created_at: string; updated_at: string; deleted_at: string | null; };
        Insert: { id?: string; product_id: string; customer_id: string; order_item_id?: string | null; rating: number; title?: string | null; body?: string | null; is_verified_purchase?: boolean; };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
        Relationships: [];
      };

      ratings: {
        Row: { id: string; seller_id: string; customer_id: string; order_id: string | null; rating: number; comment: string | null; created_at: string; };
        Insert: { id?: string; seller_id: string; customer_id: string; order_id?: string | null; rating: number; comment?: string | null; };
        Update: Record<string, never>; // ratings are immutable once submitted
        Relationships: [];
      };

      notifications: {
        Row: { id: string; profile_id: string; type: NotificationType; title: string; body: string | null; data: Json; is_read: boolean; read_at: string | null; created_at: string; };
        // Created exclusively via the send_notification() SECURITY DEFINER RPC — see migration 007.
        Insert: { id?: string; profile_id: string; type: NotificationType; title: string; body?: string | null; data?: Json; };
        Update: { is_read?: boolean; read_at?: string | null };
        Relationships: [];
      };

      support_tickets: {
        Row: { id: string; profile_id: string; order_id: string | null; subject: string; description: string; status: TicketStatus; priority: TicketPriority; assigned_to: string | null; created_at: string; updated_at: string; closed_at: string | null; };
        Insert: { id?: string; profile_id: string; order_id?: string | null; subject: string; description: string; status?: TicketStatus; priority?: TicketPriority; };
        Update: { status?: TicketStatus; priority?: TicketPriority; assigned_to?: string | null; closed_at?: string | null; };
        Relationships: [];
      };

      analytics_events: {
        Row: { id: string; profile_id: string | null; session_id: string | null; event_name: string; entity_type: string | null; entity_id: string | null; metadata: Json; created_at: string; };
        Insert: { id?: string; profile_id?: string | null; session_id?: string | null; event_name: string; entity_type?: string | null; entity_id?: string | null; metadata?: Json; };
        Update: Record<string, never>; // append-only event stream
        Relationships: [];
      };

      audit_logs: {
        Row: { id: string; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; old_data: Json | null; new_data: Json | null; ip_address: string | null; created_at: string; };
        Insert: { id?: string; actor_id?: string | null; action: string; entity_type: string; entity_id?: string | null; old_data?: Json | null; new_data?: Json | null; ip_address?: string | null; }; // written by triggers/service role only
        Update: Record<string, never>; // append-only
        Relationships: [];
      };

      reports: {
        Row: { id: string; generated_by: string | null; report_type: string; period_start: string | null; period_end: string | null; parameters: Json; file_url: string | null; created_at: string; };
        Insert: { id?: string; generated_by?: string | null; report_type: string; period_start?: string | null; period_end?: string | null; parameters?: Json; file_url?: string | null; };
        Update: Record<string, never>; // reports are regenerated, not edited
        Relationships: [];
      };

      system_settings: {
        Row: { key: string; value: Json; description: string | null; updated_at: string; updated_by: string | null; };
        Insert: { key: string; value: Json; description?: string | null; updated_by?: string | null; };
        Update: Partial<Database['public']['Tables']['system_settings']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      product_storefront_view: {
        Row: {
          id: string; name: string; slug: string; base_price: number; sale_price: number | null;
          currency: string; average_rating: number; total_reviews: number; is_featured: boolean;
          is_trending: boolean; published_at: string | null; category_name: string; category_slug: string;
          brand_name: string | null; brand_slug: string | null; seller_store_name: string; seller_id: string;
          primary_image_url: string | null; in_stock: boolean;
        };
        Relationships: [];
      };
      seller_dashboard_view: {
        Row: {
          seller_id: string; store_name: string; completed_orders: number; active_orders: number;
          lifetime_earnings: number; unpaid_earnings: number; published_products: number;
        };
        Relationships: [];
      };
      trending_products_mv: {
        Row: { id: string; name: string; slug: string; base_price: number; sale_price: number | null; average_rating: number; recent_purchase_count: number; };
        Relationships: [];
      };
    };
    Functions: {
      create_order: {
        Args: { p_customer_id: string; p_cart_id: string; p_shipping_address_id: string; p_billing_address_id: string; p_coupon_code?: string | null; };
        Returns: string; // order id
      };
      process_seller_payout: {
        Args: { p_seller_id: string; p_period_start: string; p_period_end: string; };
        Returns: string; // payout id
      };
      search_products: {
        Args: {
          p_query?: string | null; p_category_id?: string | null; p_min_price?: number | null;
          p_max_price?: number | null; p_brand_id?: string | null; p_sort?: string; p_limit?: number; p_offset?: number;
        };
        Returns: Database['public']['Tables']['products']['Row'][];
      };
      send_notification: {
        Args: { p_profile_id: string; p_type: NotificationType; p_title: string; p_body?: string | null; p_data?: Json; };
        Returns: string;
      };
      refresh_trending_products: { Args: Record<string, never>; Returns: void; };
    };
    Enums: {
      user_role: UserRole;
      seller_status: SellerStatus;
      product_status: ProductStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      payment_provider: PaymentProvider;
      payout_status: PayoutStatus;
      return_status: ReturnStatus;
      notification_type: NotificationType;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
      discount_type: DiscountType;
      address_type: AddressType;
    };
  };
}

// ------------------------------------------------------------
// Convenience row/insert/update aliases
// ------------------------------------------------------------
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row'];

export type Profile = Tables<'profiles'>;
export type SellerProfile = Tables<'seller_profiles'>;
export type Brand = Tables<'brands'>;
export type Product = Tables<'products'>;
export type ProductVariant = Tables<'product_variants'>;
export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type CartItem = Tables<'cart_items'>;
export type Review = Tables<'reviews'>;
export type Notification = Tables<'notifications'>;
export type StorefrontProduct = Views<'product_storefront_view'>;
export type SellerDashboard = Views<'seller_dashboard_view'>;
