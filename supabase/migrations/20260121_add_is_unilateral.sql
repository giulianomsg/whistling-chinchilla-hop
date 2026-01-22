-- Add is_unilateral column to exercises_library
ALTER TABLE exercises_library 
ADD COLUMN is_unilateral BOOLEAN DEFAULT FALSE;

-- Optional: Comment
COMMENT ON COLUMN exercises_library.is_unilateral IS 'Indicates if the exercise is performed unilaterally (one side at a time). If true, stats may double the weight.';
