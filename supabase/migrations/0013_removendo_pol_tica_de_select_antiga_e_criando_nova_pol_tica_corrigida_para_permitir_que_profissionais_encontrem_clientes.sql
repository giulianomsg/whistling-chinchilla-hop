-- Apagar a política antiga que está causando o problema
DROP POLICY IF EXISTS "profiles_select_own_or_public_professionals" ON public.profiles;

-- Criar nova política corrigida que permite:
-- 1. Usuários verem a si mesmos (id = auth.uid())
-- 2. Qualquer um ver todos os profissionais (role = 'professional')
-- 3. Profissionais e administradores verem todos os clientes
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
  id = auth.uid() OR
  role = 'professional' OR
  ( (public.is_professional() OR public.is_admin()) AND role = 'client' )
);