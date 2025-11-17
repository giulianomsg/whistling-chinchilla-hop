-- =================================================================
-- Migration: Correção RLS para a tabela 'workout_exercises'
-- Projeto: CapiFit
-- Data: 2025-01-17
--
-- PROBLEMA RESOLVIDO:
-- Clientes não conseguiam ver os exercícios detalhados de seus planos de treino.
-- A query retornava 0 itens porque a política RLS só permitia acesso ao 
-- profissional criador do workout.
--
-- SOLUÇÃO:
-- Criar política que permita ao profissional criador E ao cliente com 
-- workout ativo acessarem os exercícios.
-- =================================================================

-- 1. Apagar política antiga restritiva
DROP POLICY IF EXISTS "workout_exercises_select_via_workout" ON public.workout_exercises;

-- 2. Criar nova política de SELECT corrigida
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
WHERE tablename = 'workout_exercises' 
  AND policyname = 'workout_exercises_select_policy';

-- =================================================================
-- RESULTADO ESPERADO:
-- - Clientes agora podem ver todos os exercícios detalhados de seus treinos
-- - Profissionais continuam podendo acessar exercícios de seus workouts
-- - Página /app/my-workout mostra exercícios completos
-- =================================================================