-- =================================================================
-- AUTOMAÇÃO DE PERFIS - CRIAÇÃO AUTOMÁTICA PARA NOVOS USUÁRIOS
-- =================================================================

-- Função para criar perfil automaticamente quando um novo usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insere o novo usuário na tabela profiles com role padrão 'client'
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    'client'
  );
  
  -- Retorna o novo registro (boa prática)
  RETURN NEW;
END;
$$;

-- Trigger que aciona a função quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();