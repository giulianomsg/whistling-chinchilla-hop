-- =================================================================
-- Migration: Correção RLS para a tabela 'meal_plan_items'
-- Projeto: CapiFit
-- Data: 2025-01-17
--
-- PROBLEMA RESOLVIDO:
-- Clientes não conseguiam ver as refeições detalhadas de seus planos alimentares.
-- A query retornava 0 itens porque a política RLS só permitia acesso ao 
-- profissional criador do meal_plan.
--
-- SOLUÇÃO:
-- Criar política que permita ao profissional criador E ao cliente com 
-- plano ativo acessarem as refeições.
-- =================================================================

-- 1. Apagar política antiga restritiva
DROP POLICY IF EXISTS "meal_plan_items_select_via_plan" ON public.meal_plan_items;

-- 2. Criar nova política de SELECT corrigida
CREATE POLICY "meal_plan_items_select_policy" ON public.meal_plan_items
FOR SELECT
USING (
  -- Regra 1: O profissional que criou o meal_plan pode acessar os itens
  EXISTS (
    SELECT 1 
    FROM meal_plans
    WHERE meal_plans.id = meal_plan_items.meal_plan_id 
      AND meal_plans.nutritionist_id = auth.uid()
  )
  OR
  -- Regra 2: O cliente que tem o meal_plan atribuído pode acessar os itens
  EXISTS (
    SELECT 1 
    FROM client_meal_plans
    WHERE client_meal_plans.meal_plan_id = meal_plan_items.meal_plan_id 
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
WHERE tablename = 'meal_plan_items' 
  AND policyname = 'meal_plan_items_select_policy';

-- =================================================================
-- RESULTADO ESPERADO:
-- - Clientes agora podem ver todas as refeições detalhadas de seus planos
-- - Profissionais continuam podendo acessar itens de seus planos
-- - Página /app/my-meal-plan mostra refeições completas
-- =================================================================