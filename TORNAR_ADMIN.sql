-- ================================================
-- TORNAR SUA CONTA ADMIN - Execute no Supabase SQL Editor
-- ================================================

-- 1. Ver qual email você está usando
SELECT 
  'Seu email atual:' as info,
  email,
  id
FROM auth.users
WHERE email = 'contatojoaochristofoli@gmail.com';

-- 2. Adicionar como admin (TROQUE O EMAIL se necessário!)
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'contatojoaochristofoli@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Verificar se funcionou
SELECT 
  'Verificação:' as status,
  au.email,
  ur.role,
  ur.created_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'contatojoaochristofoli@gmail.com';

-- 4. Testar a função RPC
SELECT 
  'Teste RPC:' as test,
  is_user_admin(id) as is_admin,
  email
FROM auth.users
WHERE email = 'contatojoaochristofoli@gmail.com';

-- ================================================
-- Se você está usando OUTRO email, veja qual é:
-- ================================================
SELECT 
  'Todos os usuários cadastrados:' as info,
  email,
  created_at,
  id
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
