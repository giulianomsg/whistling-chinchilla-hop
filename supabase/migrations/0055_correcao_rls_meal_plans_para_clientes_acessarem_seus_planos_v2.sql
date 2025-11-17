-- =================================================================
-- Migration: Correção RLS para a tabela 'meal_plans'
-- Projeto: CapiFit
-- Data: 2025-01-17
--
-- PROBLEMA RESOLVIDO:
-- A página do cliente (/app/my-meal-plan) estava travando com 
-- TypeError: Cannot read properties of null porque a query 
-- supabase.from('client_meal_plans').select('*, meal_plan:meal_plans(*)') 
-- falhava. O select aninhado meal_plan:meal_plans(*) retornava null, pois 
-- a política de RLS da tabela meal_plans só permitia que o nutritionist_id 
-- (criador) lesse o registro.
--
-- SOLUÇÃO:
-- Substituir a política de SELECT restritiva por uma que permita ao criador 
-- (profissional) E ao cliente ativamente atribuído lerem o plano alimentar.
-- =================================================================

-- 1. Apaga a política de SELECT antiga e restritiva (se ela existir)
-- Esta política ("meal_plans_select_creator_only") provavelmente impedia que os clientes
-- lessem os planos, mesmo que estivessem atribuídos a eles, causando
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

-- 3. Verificação da política aplicada
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'meal_plans' 
  AND policyname = 'meal_plans_select_policy';

-- 4. Verificação se RLS está habilitado na tabela
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerlspolicy
FROM pg_tables 
WHERE tablename = 'meal_plans' 
  AND schemaname = 'public';

-- =================================================================
-- RESULTADO ESPERADO:
-- - Clientes agora podem acessar seus planos alimentares atribuídos
-- - Profissionais continuam podendo acessar seus próprios planos
-- - Página /app/my-meal-plan funciona sem erros de null
-- =================================================================