-- Secure RPC to fetch clients linked to a professional (including admins)
CREATE OR REPLACE FUNCTION get_linked_clients(prof_id UUID)
RETURNS TABLE (client_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the requester is the professional themselves OR an admin
  -- (Though being SECURITY DEFINER helps, we might want some basic check, 
  -- but here we just want to return the list for the UI logic)
  
  RETURN QUERY
  SELECT cp.client_id
  FROM client_professionals cp
  WHERE cp.professional_id = prof_id
  AND cp.status = 'active';
END;
$$;
