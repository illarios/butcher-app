-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sequence for order numbers
CREATE SEQUENCE order_number_seq START 1;

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  full_name text,
  phone text,
  address jsonb,
  loyalty_points integer DEFAULT 0,
  loyalty_tier text DEFAULT 'bronze',
  created_at timestamptz DEFAULT now()
);

-- Create delivery_zones table
CREATE TABLE delivery_zones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text,
  postal_codes text[],
  is_active boolean DEFAULT true,
  min_order_amount numeric(10,2) DEFAULT 0,
  delivery_fee numeric(10,2) DEFAULT 0,
  estimated_delivery_minutes integer DEFAULT 60,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text,
  slug text UNIQUE,
  description text,
  image_url text,
  display_order integer,
  is_active boolean DEFAULT true
);

-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES categories,
  name text,
  slug text UNIQUE,
  description text,
  origin text,
  breed text,
  aging_days integer,
  price_per_kg numeric(10,2),
  min_weight_grams integer DEFAULT 200,
  max_weight_grams integer DEFAULT 5000,
  step_grams integer DEFAULT 100,
  images text[],
  is_active boolean DEFAULT true,
  stock_grams integer,
  featured boolean DEFAULT false,
  recipe_ids uuid[],
  product_type text DEFAULT 'cut'  -- 'cut' or 'preparation'
);

-- Create cuts table
CREATE TABLE cuts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products,
  name text,
  description text,
  extra_price_per_kg numeric(10,2) DEFAULT 0
);

-- Create recipes table
CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text,
  slug text UNIQUE,
  description text,
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings integer,
  ingredients jsonb,
  steps jsonb,
  image_url text,
  product_ids uuid[]
);

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number text UNIQUE,
  profile_id uuid REFERENCES profiles,
  status text DEFAULT 'pending',
  fulfillment_type text NOT NULL,
  delivery_zone_id uuid REFERENCES delivery_zones,
  delivery_address jsonb,
  payment_method text DEFAULT 'cod',
  items jsonb NOT NULL,
  subtotal numeric(10,2),
  delivery_fee numeric(10,2) DEFAULT 0,
  loyalty_discount numeric(10,2) DEFAULT 0,
  total numeric(10,2),
  notes text,
  estimated_ready_at timestamptz,
  admin_note text,
  confirmed_at timestamptz,
  loyalty_points_earned integer DEFAULT 0,
  loyalty_points_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create order_status_log table
CREATE TABLE order_status_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders,
  status text NOT NULL,
  changed_by text,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles,
  plan_name text,
  frequency text,
  box_contents jsonb,
  price numeric(10,2),
  status text,
  next_delivery_date date,
  delivery_address jsonb
);

-- Create loyalty_transactions table
CREATE TABLE loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles,
  order_id uuid REFERENCES orders,
  points integer,
  type text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'MRK-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for order number
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Function to log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_log (order_id, status, changed_by, note)
    VALUES (NEW.id, NEW.status, 'system', 'Status changed');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for status log
CREATE TRIGGER log_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admin full access everywhere (service_role)
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Admin full access delivery_zones" ON delivery_zones FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Admin full access products" ON products FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Admin full access cuts" ON cuts FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Admin full access recipes" ON recipes FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Admin full access order_status_log" ON order_status_log FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Admin full access subscriptions" ON subscriptions FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Admin full access loyalty_transactions" ON loyalty_transactions FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Specific policies

-- delivery_zones: public read active, admin write (already covered by admin)
CREATE POLICY "Public read active delivery zones" ON delivery_zones
  FOR SELECT USING (is_active = true);

-- orders: users read/insert own orders only, no self-update
CREATE POLICY "Users read own orders" ON orders
  FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- order_status_log: users read own order logs only
CREATE POLICY "Users read own order logs" ON order_status_log
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE profile_id = auth.uid())
  );

-- Profiles: users can read/update their own
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories, products, cuts, recipes: public read
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read cuts" ON cuts FOR SELECT USING (true);
CREATE POLICY "Public read recipes" ON recipes FOR SELECT USING (true);

-- Subscriptions and loyalty_transactions: users own
CREATE POLICY "Users read own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users read own loyalty_transactions" ON loyalty_transactions
  FOR SELECT USING (auth.uid() = profile_id);