-- Remover a política antiga muito restritiva
DROP POLICY IF EXISTS "workouts_select_creator_only" ON public.workouts;

-- Criar nova política que permite:
-- 1. Profissional criador ver seu próprio plano
-- 2. Cliente atribuído ao plano (ativo) ver o plano
CREATE POLICY "workouts_select_policy" ON public.workouts
FOR SELECT USING (
  -- Regra 1: O profissional que criou o plano pode vê-lo.
  professional_id = auth.uid()
  OR
  -- Regra 2: O cliente que está atribuído a este plano (e está ativo) pode vê-lo.
  EXISTS (
    SELECT 1
    FROM public.client_workouts
    WHERE client_workouts.workout_id = workouts.id
      AND client_workouts.client_id = auth.uid()
      AND client_workouts.status = 'active'
  )
);