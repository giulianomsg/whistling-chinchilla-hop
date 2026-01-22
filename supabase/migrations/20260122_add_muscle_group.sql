-- Add muscle_group to exercises_library
ALTER TABLE exercises_library ADD COLUMN IF NOT EXISTS muscle_group TEXT;

-- Recommended values: 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'calves', 'quadriceps', 'hamstrings', 'glutes', 'trapezius', 'lats', 'obliques'
-- We will use a text field to allow flexibility but UI will enforce selection.
