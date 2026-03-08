-- Notifications inbox
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL,  -- 'order_received' | 'order_confirmed' | 'order_ready'
                              -- | 'order_delivered' | 'loyalty_earned' | 'loyalty_tier_up' | 'welcome'
  title       text NOT NULL,
  body        text NOT NULL DEFAULT '',
  link        text,           -- e.g. '/account/orders/<id>'
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_profile_id_idx ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON notifications(profile_id, is_read) WHERE is_read = false;

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = profile_id);

-- Service-role (admin client) can insert freely (bypasses RLS)
-- Enable Realtime on this table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
