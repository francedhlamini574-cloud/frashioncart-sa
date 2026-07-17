// ============================================================================
// FrashionCart S.A — database.types.ts
// Hand-written types matching supabase/migrations/0001_schema.sql.
// Once the project is linked, prefer generating this automatically with:
//   supabase gen types typescript --project-id <ref> > types/database.types.ts
// This file is a good starting point / fallback until then.
// ============================================================================

export type UserRole = 'customer' | 'brand' | 'admin';
export type BrandStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ProductGender = 'men' | 'women' | 'unisex' | 'kids';
export type ProductStatus = 'draft' | 'published' | 'archived';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed';
export type SellerAppStatus = 'pending' | 'approved' | 'rejected';
export type InventoryReason = 'restock' | 'sale' | 'return' | 'adjustment';

export interface Profile {
  id: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
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
}

export interface Brand {
  id: string;
  owner_id: string;
  brand_name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  location: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  commission_rate: number;
  status: BrandStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  brand_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  gender: ProductGender;
  price_zar: number;
  discount_percentage: number;
  currency: string;
  status: ProductStatus;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku: string | null;
  price_override: number | null;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  position: number;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_variant_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal_zar: number;
  discount_total_zar: number;
  shipping_fee_zar: number;
  total_zar: number;
  currency: string;
  shipping_address_id: string | null;
  shipping_snapshot: Record<string, unknown> | null;
  notes: string | null;
  placed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_variant_id: string | null;
  brand_id: string;
  product_name: string;
  size: string | null;
  color: string | null;
  unit_price_zar: number;
  discount_percentage: number;
  quantity: number;
  line_total_zar: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  provider_reference: string | null;
  amount_zar: number;
  currency: string;
  status: PaymentStatus;
  paid_at: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

export interface Payout {
  id: string;
  brand_id: string;
  period_start: string;
  period_end: string;
  gross_amount_zar: number;
  commission_zar: number;
  net_amount_zar: number;
  status: PayoutStatus;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_item_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface InventoryEntry {
  id: string;
  product_variant_id: string;
  change_quantity: number;
  reason: InventoryReason;
  reference_id: string | null;
  created_at: string;
}

export interface SellerApplication {
  id: string;
  applicant_id: string;
  brand_name: string;
  tagline: string | null;
  description: string | null;
  location: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  portfolio_url: string | null;
  status: SellerAppStatus;
  reviewer_id: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// ----------------------------------------------------------------------------
// Composite / joined shapes commonly used by the frontend
// ----------------------------------------------------------------------------

export interface ProductWithDetails extends Product {
  images: ProductImage[];
  variants: ProductVariant[];
  brand: Pick<Brand, 'id' | 'brand_name' | 'slug' | 'logo_url'>;
  category: Pick<Category, 'id' | 'name' | 'slug'> | null;
}

export interface CartItemWithProduct extends CartItem {
  variant: ProductVariant & {
    product: Pick<Product, 'id' | 'name' | 'slug' | 'price_zar' | 'discount_percentage'> & {
      images: Pick<ProductImage, 'url'>[];
    };
  };
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface SellerOrderRow {
  order_id: string;
  order_status: OrderStatus;
  placed_at: string | null;
  item_id: string;
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  line_total_zar: number;
}

// ----------------------------------------------------------------------------
// Supabase generated-style Database type, for use with createClient<Database>()
// ----------------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      addresses: { Row: Address; Insert: Omit<Address, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Address> };
      brands: { Row: Brand; Insert: Omit<Brand, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Brand> };
      categories: { Row: Category; Insert: Omit<Category, 'id' | 'created_at'>; Update: Partial<Category> };
      products: { Row: Product; Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Product> };
      product_variants: { Row: ProductVariant; Insert: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>; Update: Partial<ProductVariant> };
      product_images: { Row: ProductImage; Insert: Omit<ProductImage, 'id' | 'created_at'>; Update: Partial<ProductImage> };
      wishlists: { Row: Wishlist; Insert: Omit<Wishlist, 'id' | 'created_at'>; Update: Partial<Wishlist> };
      cart_items: { Row: CartItem; Insert: Omit<CartItem, 'id' | 'created_at' | 'updated_at'>; Update: Partial<CartItem> };
      orders: { Row: Order; Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Order> };
      order_items: { Row: OrderItem; Insert: Omit<OrderItem, 'id' | 'created_at'>; Update: Partial<OrderItem> };
      payments: { Row: Payment; Insert: Omit<Payment, 'id' | 'created_at'>; Update: Partial<Payment> };
      payouts: { Row: Payout; Insert: Omit<Payout, 'id' | 'created_at'>; Update: Partial<Payout> };
      reviews: { Row: Review; Insert: Omit<Review, 'id' | 'created_at'>; Update: Partial<Review> };
      inventory: { Row: InventoryEntry; Insert: Omit<InventoryEntry, 'id' | 'created_at'>; Update: Partial<InventoryEntry> };
      seller_applications: { Row: SellerApplication; Insert: Omit<SellerApplication, 'id' | 'created_at'>; Update: Partial<SellerApplication> };
    };
    Functions: {
      get_featured_products: { Args: { p_limit?: number }; Returns: Product[] };
      get_new_arrivals: { Args: { p_limit?: number }; Returns: Product[] };
      get_products_by_category: { Args: { p_category_slug: string; p_limit?: number; p_offset?: number }; Returns: Product[] };
      get_products_by_brand: { Args: { p_brand_slug: string; p_limit?: number; p_offset?: number }; Returns: Product[] };
      search_products: {
        Args: {
          p_query?: string | null;
          p_min_price?: number | null;
          p_max_price?: number | null;
          p_gender?: ProductGender | null;
          p_category_slug?: string | null;
          p_min_discount?: number | null;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: Product[];
      };
      toggle_wishlist: { Args: { p_product_id: string }; Returns: boolean };
      add_to_cart: { Args: { p_variant_id: string; p_quantity?: number }; Returns: CartItem };
      place_order: {
        Args: { p_items: { variant_id: string; quantity: number }[]; p_shipping_address_id: string; p_shipping_fee_zar?: number };
        Returns: Order;
      };
      get_seller_orders: { Args: { p_brand_id: string }; Returns: SellerOrderRow[] };
      approve_seller_application: { Args: { p_application_id: string }; Returns: Brand };
    };
  };
}
