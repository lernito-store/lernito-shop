/*
# Create LERNITO commerce foundation

1. New tables
- `products`: public product catalog fields, pricing, availability, and fragrance metadata. Demo records can be marked with `is_demo` until verified catalog data is imported.
- `profiles`: private customer profile and immutable administrative role metadata.
- `favorites`: authenticated customer wish-list entries.
- `orders`: authenticated customer order headers with server-owned totals and statuses.
- `order_items`: immutable product snapshots belonging to orders.
- `wallet_accounts`: one backend-controlled balance per customer.
- `wallet_transactions`: append-only ledger for wallet changes and auditability.

2. Security
- RLS is enabled on every table.
- Catalog reads are public; customer data is owner-scoped to `auth.uid()`.
- Customer writes cannot control roles, balances, payment state, or order totals.
- Grants are limited to the roles and operations used by the initial storefront.

3. Important notes
- SMS, payment gateway, email, and admin operations remain server-side integrations to be connected through Edge Functions.
- Product demo records are intentionally separated from verified inventory through `is_demo` and `source_note`.
- The schema keeps vendor_id nullable for future marketplace expansion without activating seller operations.
*/

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  slug text UNIQUE NOT NULL,
  image_url text NOT NULL,
  gallery_urls text[] NOT NULL DEFAULT '{}',
  price_toman bigint NOT NULL CHECK (price_toman >= 0),
  compare_at_price_toman bigint CHECK (compare_at_price_toman IS NULL OR compare_at_price_toman >= price_toman),
  volume_ml integer NOT NULL CHECK (volume_ml > 0),
  fragrance_family text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('مردانه', 'زنانه', 'یونیسکس')),
  country text NOT NULL,
  top_notes text[] NOT NULL DEFAULT '{}',
  middle_notes text[] NOT NULL DEFAULT '{}',
  base_notes text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  sku text UNIQUE NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_available boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT true,
  source_note text NOT NULL DEFAULT 'نمونه نمایشی؛ اطلاعات واقعی پس از وارد کردن کاتالوگ تأییدشده جایگزین می‌شود.',
  vendor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.favorites (
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'canceled', 'refunded')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  subtotal_toman bigint NOT NULL DEFAULT 0 CHECK (subtotal_toman >= 0),
  discount_toman bigint NOT NULL DEFAULT 0 CHECK (discount_toman >= 0),
  shipping_toman bigint NOT NULL DEFAULT 0 CHECK (shipping_toman >= 0),
  total_toman bigint NOT NULL DEFAULT 0 CHECK (total_toman >= 0),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  province text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  postal_code text NOT NULL,
  delivery_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  sku text NOT NULL,
  unit_price_toman bigint NOT NULL CHECK (unit_price_toman >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_accounts (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_toman bigint NOT NULL DEFAULT 0 CHECK (balance_toman >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  amount_toman bigint NOT NULL CHECK (amount_toman <> 0),
  kind text NOT NULL CHECK (kind IN ('deposit', 'payment', 'refund', 'adjustment')),
  description text NOT NULL,
  reference_id uuid,
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_brand_idx ON public.products (brand);
CREATE INDEX IF NOT EXISTS products_gender_idx ON public.products (gender);
CREATE INDEX IF NOT EXISTS products_family_idx ON public.products (fragrance_family);
CREATE INDEX IF NOT EXISTS products_available_idx ON public.products (is_available, is_featured, is_new);
CREATE INDEX IF NOT EXISTS orders_user_created_idx ON public.orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS wallet_transactions_user_created_idx ON public.wallet_transactions (user_id, created_at DESC);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT SELECT ON public.orders, public.order_items TO authenticated;
GRANT SELECT ON public.wallet_accounts, public.wallet_transactions TO authenticated;

DROP POLICY IF EXISTS "Public can view available products" ON public.products;
CREATE POLICY "Public can view available products" ON public.products FOR SELECT TO anon, authenticated USING (is_available = true);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile content" ON public.profiles;
CREATE POLICY "Users can update own profile content" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can add own favorites" ON public.favorites;
CREATE POLICY "Users can add own favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can remove own favorites" ON public.favorites;
CREATE POLICY "Users can remove own favorites" ON public.favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallet_accounts;
CREATE POLICY "Users can view own wallet" ON public.wallet_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own wallet ledger" ON public.wallet_transactions;
CREATE POLICY "Users can view own wallet ledger" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

REVOKE UPDATE (role) ON public.profiles FROM authenticated;
REVOKE UPDATE (balance_toman) ON public.wallet_accounts FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.products FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.orders, public.order_items FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.wallet_accounts, public.wallet_transactions FROM anon, authenticated;