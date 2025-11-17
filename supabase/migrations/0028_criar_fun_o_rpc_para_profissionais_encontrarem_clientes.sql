CREATE OR REPLACE FUNCTION find_client_by_email(client_email text)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é profissional ou admin
  IF NOT (is_professional() OR is_admin()) THEN
    RAISE EXCEPTION 'Apenas profissionais podem buscar clientes';
  END IF;
  
  -- Retornar cliente encontrado
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at
  FROM public.profiles p
  WHERE p.email = client_email 
    AND p.role = 'client'
  LIMIT 1;
  
  RETURN;
END;
$$;