-- Asal Glow commerce schema (Neon / Lakebase Postgres)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL CHECK (price_cents > 0),
  currency text NOT NULL DEFAULT 'usd',
  image_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  email text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'canceled', 'refunded')),
  amount_total integer NOT NULL DEFAULT 0 CHECK (amount_total >= 0),
  currency text NOT NULL DEFAULT 'usd',
  stripe_checkout_session_id text UNIQUE,
  stripe_payment_intent_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id uuid REFERENCES products (id) ON DELETE SET NULL,
  name text NOT NULL,
  unit_amount integer NOT NULL CHECK (unit_amount >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_stripe_session_idx ON orders (stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);

INSERT INTO products (slug, name, description, price_cents, currency)
VALUES
  (
    'honey-glow-serum',
    'Honey Glow Serum',
    'Lightweight vitamin serum for daily radiance.',
    3800,
    'usd'
  ),
  (
    'asal-clay-mask',
    'Asal Clay Mask',
    'Gentle clarifying mask for balanced skin.',
    2800,
    'usd'
  ),
  (
    'dew-moisturizer',
    'Dew Moisturizer',
    'Hydrating cream for soft, calm skin.',
    4200,
    'usd'
  )
ON CONFLICT (slug) DO NOTHING;
