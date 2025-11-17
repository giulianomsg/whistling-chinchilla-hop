UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data, 
  '{full_name}', 
  '"Profissional Teste"'
)
WHERE email = 'profissional@capifit.com';