-- Drop existing functions to recreate them properly
DROP FUNCTION IF EXISTS get_all_users();
DROP FUNCTION IF EXISTS admin_update_user_role(UUID, TEXT);

-- Recreate with explicit column mapping and debugging
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth -- CRITICAL: Ensure access to auth schema
AS $$
BEGIN
  -- Check if the requesting user is an admin
  -- Use explicit referencing to avoid ambiguity
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    au.email::TEXT, -- Cast to ensure type matching
    p.full_name,
    p.role::TEXT,
    p.created_at,
    au.last_sign_in_at
  FROM public.profiles p
  JOIN auth.users au ON p.id = au.id
  ORDER BY p.created_at DESC;
END;
$$;

-- Function to update roles
CREATE OR REPLACE FUNCTION admin_update_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Check Admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Validate: Self-demotion check
  IF target_user_id = auth.uid() AND new_role != 'admin' THEN
    RAISE EXCEPTION 'You cannot remove your own admin privileges.';
  END IF;

  -- Validate Role
  IF new_role NOT IN ('client', 'professional', 'admin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  -- Update Profile
  UPDATE public.profiles
  SET role = new_role
  WHERE id = target_user_id;

  -- Update Auth Metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(new_role)
  )
  WHERE id = target_user_id;
END;
$$;
