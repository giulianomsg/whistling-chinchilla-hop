CREATE OR REPLACE FUNCTION find_client_by_email(client_email text)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz,
  existing_link_id uuid,
  existing_link_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é profissional ou admin
  IF NOT (is_professional() OR is_admin()) THEN
    RAISE EXCEPTION 'Apenas profissionais podem buscar clientes';
  END IF;
  
  -- Retornar cliente encontrado com informações de vínculo existente
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    cp.id as existing_link_id,
    cp.status as existing_link_status
  FROM public.profiles p
  LEFT JOIN public.client_professionals cp ON (
    cp.client_id = p.id 
    AND cp.professional_id = auth.uid()
  )
  WHERE p.email = client_email 
    AND p.role = 'client'
  LIMIT 1;
  
  RETURN;
END;
$$;