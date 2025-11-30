-- 🔧 SCRIPT DE CORREÇÃO COMPLETO
-- Execute TUDO de uma vez no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente para testar
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- 2. Adicionar coluna user_id à tabela creators (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='creators' AND column_name='user_id') THEN
    ALTER TABLE creators ADD COLUMN user_id UUID REFERENCES auth.users(id);
    CREATE INDEX idx_creators_user_id ON creators(user_id);
  END IF;
END $$;

-- 3. Garantir que você é admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'contatojoaochristofoli@gmail.com'  -- ⚠️ TROQUE SE NECESSÁRIO!
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Verificar se funcionou
SELECT 'user_roles criados:' as status, COUNT(*) as count FROM user_roles;
SELECT 'Você é admin:' as status, EXISTS(
  SELECT 1 FROM user_roles ur
  JOIN auth.users au ON ur.user_id = au.id
  WHERE au.email = 'contatojoaochristofoli@gmail.com' AND ur.role = 'admin'
) as is_admin;

-- 5. Ver estrutura da tabela creators
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'creators' 
ORDER BY ordinal_position;
