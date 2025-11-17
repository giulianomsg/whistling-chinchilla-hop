-- Remover política antiga
DROP POLICY IF EXISTS "workout_exercises_select_via_workout" ON public.workout_exercises;

-- Criar nova política que permite acesso do cliente através do client_workouts
CREATE POLICY "workout_exercises_select_policy" ON public.workout_exercises
FOR SELECT
USING (
  -- Regra 1: O profissional que criou o workout pode acessar os exercícios
  EXISTS (
    SELECT 1 
    FROM workouts
    WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.professional_id = auth.uid()
  )
  OR
  -- Regra 2: O cliente que tem o workout atribuído pode acessar os exercícios
  EXISTS (
    SELECT 1 
    FROM client_workouts
    WHERE client_workouts.workout_id = workout_exercises.workout_id 
      AND client_workouts.client_id = auth.uid() 
      AND client_workouts.status = 'active'
  )
);