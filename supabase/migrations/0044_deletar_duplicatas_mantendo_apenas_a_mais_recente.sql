-- Deletar planos duplicados mantendo apenas o mais recente
WITH ranked_plans AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY created_at DESC) as rn
  FROM client_workouts
  WHERE status = 'active'
)
DELETE FROM client_workouts 
WHERE id IN (
  SELECT id FROM ranked_plans WHERE rn > 1
);