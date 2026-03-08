-- Performance indexes for production

-- Products
CREATE INDEX IF NOT EXISTS products_slug_idx     ON products(slug);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS products_active_idx   ON products(is_active) WHERE is_active = true;

-- Orders
CREATE INDEX IF NOT EXISTS orders_profile_id_idx  ON orders(profile_id);
CREATE INDEX IF NOT EXISTS orders_status_idx      ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx  ON orders(created_at DESC);

-- Delivery zones — GIN index for array containment queries (postal_codes @> ARRAY['12345'])
CREATE INDEX IF NOT EXISTS delivery_zones_postal_codes_gin ON delivery_zones USING GIN(postal_codes);

-- Order status log
CREATE INDEX IF NOT EXISTS order_status_log_order_id_idx ON order_status_log(order_id);

-- Notifications (already added in 006, kept here for completeness)
CREATE INDEX IF NOT EXISTS notifications_profile_unread ON notifications(profile_id, is_read) WHERE is_read = false;
