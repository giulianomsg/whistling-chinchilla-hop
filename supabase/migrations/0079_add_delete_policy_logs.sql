-- Add DELETE policy for workout_execution_logs
-- Missing policy caused users to be unable to delete their own logs.

CREATE POLICY "Users can delete their own execution logs" ON public.workout_execution_logs
FOR DELETE
USING (
  auth.uid() IN (
    SELECT client_id FROM public.workout_sessions WHERE id = workout_session_id
  )
);

-- Also add UPDATE policy just in case it's needed later (e.g. editing weights)
CREATE POLICY "Users can update their own execution logs" ON public.workout_execution_logs
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT client_id FROM public.workout_sessions WHERE id = workout_session_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT client_id FROM public.workout_sessions WHERE id = workout_session_id
  )
);
