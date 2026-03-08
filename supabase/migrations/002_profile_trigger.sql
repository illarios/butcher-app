-- Auto-create profile row when a new user signs up via auth.users
-- Also grants 50 welcome loyalty points.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, loyalty_points, loyalty_tier)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone',
    50,       -- welcome bonus points
    'bronze'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Record the welcome points as a loyalty transaction
  INSERT INTO public.loyalty_transactions (profile_id, points, type, description)
  VALUES (NEW.id, 50, 'earn', 'Πόντοι καλωσορίσματος');

  RETURN NEW;
END;
$$;

-- Trigger fires after each new auth user is inserted
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
