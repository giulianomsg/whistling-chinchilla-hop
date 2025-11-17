-- =================================================================
-- Migration: Correção RLS para meal_plans (v2)
-- Projeto: CapiFit
-- Data: 2025-11-17
--
-- PROBLEMA RESOLVIDO:
-- A página ClientMealPlan.tsx estava travando com 
-- TypeError: Cannot read properties of null (reading 'name')
-- porque a query supabase.from('client_meal_plans').select('*, meal_plan:meal_plans(*)')
-- retornava meal_plan como null.
--
-- CAUSA RAIZ:
-- A política de RLS "meal_plans_select_creator_only" só permitia
-- que o nutritionist_id (criador) lesse o registro, bloqueando
-- o acesso do cliente mesmo quando estava ativamente atribuído.
--
-- SOLUÇÃO:
-- Substituir a política restritiva por uma que permita
-- ao criador E ao cliente ativamente associado lerem o plano.
-- =================================================================

-- 1. Apaga a política de SELECT antiga e restritiva
-- Esta política impedia que os clientes lessem os planos,
-- mesmo que estivessem atribuídos a eles, causando
-- um retorno 'null' no JOIN e o bug 'Cannot read properties of null'.
DROP POLICY IF EXISTS "meal_plans_select_creator_only" ON public.meal_plans;

-- 2. Cria a nova política de SELECT corrigida
-- Esta política permite que o profissional que criou OU o cliente
-- ativamente associado possam ler o registro do plano.
CREATE POLICY "meal_plans_select_policy" ON public.meal_plans
FOR SELECT
USING (
  -- Regra 1: O profissional (nutritionist_id) que criou o plano pode vê-lo.
  nutritionist_id = auth.uid()
  OR
  -- Regra 2: O cliente (client_id) que está atribuído a este plano
  -- através da tabela 'client_meal_plans' (e tem o status 'active') pode vê-lo.
  EXISTS (
    SELECT 1
    FROM public.client_meal_plans
    WHERE client_meal_plans.meal_plan_id = meal_plans.id
      AND client_meal_plans.client_id = auth.uid()
      AND client_meal_plans.status = 'active'
  )
);

-- 3. Verificação da nova política
-- SELECT * FROM pg_policies 
-- WHERE tablename = 'meal_plans' AND policyname = 'meal_plans_select_policy';

-- 4. Teste manual (executar como cliente):
-- SELECT cp.*, mp.* 
-- FROM client_meal_plans cp
-- JOIN meal_plans mp ON cp.meal_plan_id = mp.id
-- WHERE cp.client_id = 'UUID_DO_CLIENTE' 
--   AND cp.status = 'active';

-- =================================================================
-- RESULTADO ESPERADO:
-- ✅ ClientMealPlan.tsx agora funciona sem erros de null
-- ✅ meal_plan:meal_plans(*) retorna dados corretamente
-- ✅ Clientes podem visualizar seus planos alimentares
-- ✅ Profissionais mantêm acesso aos seus planos
-- =================================================================