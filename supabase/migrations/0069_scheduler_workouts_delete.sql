
-- Enable DELETE for professionals on scheduled_workouts

CREATE POLICY "scheduled_workouts_delete_professional" ON "public"."scheduled_workouts"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM client_professionals cp
    WHERE cp.client_id = scheduled_workouts.client_id
    AND cp.professional_id = auth.uid()
  )
);
