-- Push subscriptions for web push notifications
create table if not exists push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid references profiles(id) on delete cascade not null,
  subscription jsonb not null,
  created_at   timestamptz default now()
);

-- Index for fast lookup by profile
create index if not exists push_subscriptions_profile_id_idx
  on push_subscriptions(profile_id);

-- RLS: users can only manage their own subscriptions
alter table push_subscriptions enable row level security;

create policy "Users manage own push subscriptions"
  on push_subscriptions
  for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
