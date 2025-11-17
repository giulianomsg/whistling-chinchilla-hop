-- Remover política existente se houver
DROP POLICY IF EXISTS "client_workouts_select_client_or_nutritionist" ON client_workouts;
DROP POLICY IF EXISTS "client_workouts_select_client_or_professional" ON client_workouts;
DROP POLICY IF EXISTS "client_workouts_insert_professional_only" ON client_workouts;
DROP POLICY IF EXISTS "client_workouts_update_assigning_professional" ON client_workouts;
DROP POLICY IF EXISTS "client_workouts_delete_assigning_professional" ON client_workouts;

-- Criar nova política que permite clientes verem seus próprios planos
CREATE POLICY "client_workouts_select_client_or_professional" ON client_workouts
FOR SELECT TO authenticated
USING (
  (client_id = auth.uid()) OR 
  (professional_id = auth.uid())
);

-- Política para profissionais inserirem planos para clientes
CREATE POLICY "client_workouts_insert_professional_only" ON client_workouts
FOR INSERT TO authenticated
WITH CHECK (
  (professional_id = auth.uid()) AND 
  professional_has_client_access(client_id)
);

-- Política para profissionais atualizarem planos
CREATE POLICY "client_workouts_update_assigning_professional" ON client_workouts
FOR UPDATE TO authenticated
USING (professional_id = auth.uid())
WITH CHECK (professional_id = auth.uid());

-- Política para profissionais removerem planos
CREATE POLICY "client_workouts_delete_assigning_professional" ON client_workouts
FOR DELETE TO authenticated
USING (professional_id = auth.uid());