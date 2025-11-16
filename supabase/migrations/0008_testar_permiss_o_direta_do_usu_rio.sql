SELECT 
  auth.uid() as current_user_id,
  auth.jwt() as jwt_token,
  auth.role() as auth_role;