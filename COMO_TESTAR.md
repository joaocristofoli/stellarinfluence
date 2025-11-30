# Como Aplicar as Migrações e Testar os Painéis

## 🔴 PROBLEMA ATUAL

Você não consegue acessar `/admin` porque:
1. As migrações SQL não foram aplicadas ainda
2. A tabela `user_roles` pode não existir
3. Não há admin criado

## ✅ SOLUÇÃO RÁPIDA

### Opção 1: Aplicar Migrações (Recomendado)

```bash
cd supabase
supabase migration up
```

Se der erro, tente:

```bash
supabase db push
```

###Option 2: SQL Manual (Mais Rápido)

Vá no **Supabase Dashboard** → **SQL Editor** e execute:

```sql
-- 1. Criar tabela user_roles se não existir
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 2. Adicionar user_id à tabela creators
ALTER TABLE creators 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 3. Tornar VOCÊ um admin (SUBSTITUA O EMAIL!)  
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'SEU-EMAIL-AQUI@gmail.com'
ON CONFLICT DO NOTHING;
```

**Importante:** Troque `'SEU-EMAIL-AQUI@gmail.com'` pelo email que você usou para se registrar!

### Opção 3: Registrar Novo Admin

1. Saia da conta atual (botão "Sair")
2. Clique em "Criar conta"
3. No campo "Código Secreto" digite: `admin123`
4. Complete o cadastro
5. Login → você será redirecionado para `/admin`

## 🧪 TESTAR

### Testar Admin
1. Faça login
2. Deve redirecionar para `/admin`
3. Veja as tabs: Criadores, Preços, Reservas

### Testar Creator
1. No SQL Editor, vincule um creator ao seu usuário:
```sql
UPDATE creators 
SET user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@gmail.com')
WHERE id = 'algum-creator-id';
```
2. Faça login
3. Deve redirecionar para `/creator/dashboard`

## ❓ AINDA NÃO FUNCIONA?

Abra o Console do navegador (F12) e veja se há erros.
Me envie os erros que aparecem!
