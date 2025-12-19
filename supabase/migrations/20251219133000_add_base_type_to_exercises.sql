-- Migration to add base_type to exercises_library
-- Created via Agentic Assistant

ALTER TABLE public.exercises_library 
ADD COLUMN IF NOT EXISTS base_type text;

-- Add a check constraint
ALTER TABLE public.exercises_library 
ADD CONSTRAINT check_base_type 
CHECK (base_type IN ('squat', 'bench', 'deadlift', 'overhead'));

COMMENT ON COLUMN public.exercises_library.base_type IS 'Canonical Powerlifting movement type (squat, bench, deadlift, overhead) for strength calculations';
