-- Migration: 20260301000002_data_integrity_constraints.sql
-- Description: Adds check constraints for physical integrity and structural integrity to workout execution.

-- 1. Clean up existing invalid data so the constraint can be applied
UPDATE public.exercises_library 
SET muscle_group = NULL 
WHERE muscle_group IS NOT NULL 
  AND muscle_group NOT IN (
    'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 
    'Abdômen', 'Glúteos', 'Lombar', 'Corpo Inteiro', 
    'Cardio', 'Outro'
  );

-- 2. Restrict muscle_group to a strict standardized list
ALTER TABLE public.exercises_library ADD CONSTRAINT exercises_library_muscle_group_check 
  CHECK (
    muscle_group IS NULL OR 
    muscle_group IN (
      'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 
      'Abdômen', 'Glúteos', 'Lombar', 'Corpo Inteiro', 
      'Cardio', 'Outro'
    )
  );

-- 2. Structurally enforce integer type for reps, with intrinsic safety
ALTER TABLE public.workout_execution_logs ALTER COLUMN reps TYPE integer USING reps::integer;

-- 3. Add mathematical constraints to prevent negative outputs
ALTER TABLE public.workout_execution_logs ADD CONSTRAINT reps_positive CHECK (reps > 0);
ALTER TABLE public.workout_execution_logs ADD CONSTRAINT weight_positive CHECK (weight >= 0);
