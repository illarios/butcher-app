-- Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';

-- Index for fast admin lookups
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Admin RLS: users with role='admin' get full access via JWT app_metadata
-- We use a helper function so we don't repeat the check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- Admin policies using role check (for anon_key connections, not service_role)
CREATE POLICY "Admins full access orders"
  ON orders FOR ALL USING (is_admin());

CREATE POLICY "Admins full access profiles"
  ON profiles FOR ALL USING (is_admin());

CREATE POLICY "Admins full access delivery_zones_write"
  ON delivery_zones FOR ALL USING (is_admin());

CREATE POLICY "Admins full access products_write"
  ON products FOR ALL USING (is_admin());

CREATE POLICY "Admins full access categories_write"
  ON categories FOR ALL USING (is_admin());

CREATE POLICY "Admins full access cuts_write"
  ON cuts FOR ALL USING (is_admin());

CREATE POLICY "Admins full access recipes_write"
  ON recipes FOR ALL USING (is_admin());

CREATE POLICY "Admins full access order_status_log"
  ON order_status_log FOR ALL USING (is_admin());

CREATE POLICY "Admins full access loyalty_transactions"
  ON loyalty_transactions FOR ALL USING (is_admin());

-- To make a user an admin, run:
-- UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
