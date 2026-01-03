-- Migration to fix RLS policy for professional_details insert
-- The previous policy 'professional_details_insert_own' relied on 'is_professional()' function
-- which only checked for 'professional' role. Admins were excluded.

-- 1. Update is_professional() to include admins OR create a new check
-- Updating is_professional() is better as it might be used elsewhere where admins should also have access.

CREATE OR REPLACE FUNCTION public.is_professional()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role = 'professional' OR role = 'admin')
  );
END;
$$;
