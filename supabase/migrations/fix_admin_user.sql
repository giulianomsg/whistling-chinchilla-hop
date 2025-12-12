-- Script para promover usuário a Admin e sincronizar metadados
-- Substitua 'admin@capifit.com' pelo email desejado se necessário

DO $$
DECLARE
  target_email TEXT := 'admin@capifit.com';
  target_id UUID;
BEGIN
  -- Buscar ID do usuário
  SELECT id INTO target_id FROM auth.users WHERE email = target_email;

  IF target_id IS NOT NULL THEN
    -- 1. Atualizar tabela profiles (Aplicação)
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = target_id;

    -- 2. Atualizar tabela auth.users (Metadados do Supabase Auth)
    -- Isso garante que o token JWT gerado no próximo login contenha a role correta
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"'
    )
    WHERE id = target_id;

    RAISE NOTICE 'Usuário % (ID: %) promovido a Admin com sucesso.', target_email, target_id;
  ELSE
    RAISE WARNING 'Usuário % não encontrado.', target_email;
  END IF;
END $$;
