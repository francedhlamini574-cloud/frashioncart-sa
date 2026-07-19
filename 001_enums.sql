-- ============================================================
-- FrashionCart S.A. — Migration 001: Enums / Custom Types
-- ============================================================

create type user_role as enum ('customer', 'seller', 'admin', 'super_admin');

create type seller_status as enum ('pending', 'approved', 'rejected', 'suspended');

create type product_status as enum ('draft', 'published', 'archived');

create type order_status as enum (
  'pending', 'confirmed', 'processing', 'shipped',
  'delivered', 'cancelled', 'refunded', 'failed'
);

create type payment_status as enum ('pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded');

create type payment_provider as enum ('payfast', 'yoco', 'stripe', 'paypal', 'manual');

create type payout_status as enum ('pending', 'processing', 'paid', 'failed', 'on_hold');

create type return_status as enum ('requested', 'approved', 'rejected', 'received', 'refunded');

create type notification_type as enum (
  'order_update', 'payment', 'payout', 'review', 'promotion',
  'system', 'seller_approval', 'stock_alert'
);

create type ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');

create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');

create type discount_type as enum ('percentage', 'fixed_amount');

create type address_type as enum ('shipping', 'billing', 'both');
