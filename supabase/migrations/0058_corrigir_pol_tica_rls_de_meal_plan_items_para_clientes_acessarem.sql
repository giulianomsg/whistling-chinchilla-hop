-- Remover política antiga
DROP POLICY IF EXISTS "meal_plan_items_select_via_plan" ON public.meal_plan_items;

-- Criar nova política que permite acesso do cliente através do client_meal_plans
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