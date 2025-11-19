-- Migração: Criar função RPC find_client_by_email
-- Objetivo: Permitir que profissionais busquem clientes por email e verifiquem vínculos existentes

-- Função segura para buscar cliente por email e verificar vínculo existente
CREATE OR REPLACE FUNCTION public.find_client_by_email(client_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  existing_link_id UUID,
  existing_link_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com permissões de admin para buscar na tabela profiles
AS $$
DECLARE
  found_user_id UUID;
BEGIN
  -- 1. Buscar ID do usuário pelo email na tabela profiles
  SELECT p.id INTO found_user_id
  FROM public.profiles p
  WHERE p.email = client_email AND p.role = 'client';

  -- 2. Se não encontrar, retorna vazio
  IF found_user_id IS NULL THEN
    RETURN;
  END IF;

  -- 3. Retornar dados do perfil e info de vínculo com o profissional atual (auth.uid())
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    cp.id as existing_link_id,
    cp.status as existing_link_status
  FROM public.profiles p
  LEFT JOIN public.client_professionals cp 
    ON cp.client_id = p.id AND cp.professional_id = auth.uid()
  WHERE p.id = found_user_id;
END;
$$;

-- Adicionar comentário para documentação
COMMENT ON FUNCTION public.find_client_by_email IS 'Busca cliente por email e verifica se já existe vínculo com o profissional atual';