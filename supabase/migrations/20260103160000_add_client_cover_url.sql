-- Add cover_url to client_details if it doesn't exist
ALTER TABLE public.client_details ADD COLUMN IF NOT EXISTS cover_url text;

-- Ensure RLS allows clients to update their own details (if not already handled)
-- Usually client_details RLS allows update based on profile_id = auth.uid()
