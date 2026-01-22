-- Add muscle_groups array to exercises_library
ALTER TABLE exercises_library ADD COLUMN IF NOT EXISTS muscle_groups TEXT[];

-- Optional: Migrate existing muscle_group (singular) to muscle_groups (array) if needed
-- UPDATE exercises_library SET muscle_groups = ARRAY[muscle_group] WHERE muscle_group IS NOT NULL AND muscle_groups IS NULL;
