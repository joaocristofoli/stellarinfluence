# 🧪 GUIA DE TESTE - Sistema de Autenticação

## ⚠️ PASSO 1: APLICAR MIGRATION NO SUPABASE

**IMPORTANTE**: Antes de testar, você DEVE executar a migration no banco de dados!

1. Abra o Supabase Dashboard
2. Vá para **SQL Editor** → **New Query**
3. Abra o arquivo `APPLY_AUTH_FIX.sql` neste projeto
4. Copie TODO o conteúdo e cole no SQL Editor
5. Clique em **RUN** para executar
6. Verifique as mensagens de sucesso ✅

---

## 📝 PASSO 2: TESTES NO NAVEGADOR

### Teste 1: Verificar Console (IMPORTANTE)

1. Abra http://localhost:8080
2. Abra o DevTools (F12)
3. Vá para a aba **Console**
4. Faça login

**✅ O que você DEVE ver:**
```
🔐 Auth state changed: INITIAL_SESSION seu@email.com
📱 Initial session: seu@email.com
👨‍💼 Admin check (RPC): {isAdminData: true/false, userId: "..."}
🎨 Creator check: {creatorData: {...}, userId: "..."}
✅ Auth complete: {isAdmin: true, isCreator: false}
```

**❌ O que você NÃO deve ver:**
- ❌ Erro 404 para `is_user_admin`
- ❌ Erro 400 para `creators`
- ❌ Mensagens de erro em vermelho

---

### Teste 2: Login como Admin Master

**Pré-requisito**: Sua conta deve estar na tabela `user_roles` com `role = 'admin'`

1. Acesse http://localhost:8080/auth
2. Faça login com: `contatojoaochristofoli@googlemail.com`
3. **Esperado**: Redirecionamento automático para `/admin`
4. Verifique que você vê o "Painel Admin" com todas as abas

**Teste adicional:**
- Tente acessar http://localhost:8080/creator/dashboard
- **Esperado**: Redirecionamento automático de volta para `/admin`

---

### Teste 3: Login como Creator

**Pré-requisito**: Precisa de uma conta vinculada na tabela `creators`

1. Faça logout
2. Crie um creator no painel admin OU
3. Vincule uma conta existente:
   ```sql
   -- No Supabase SQL Editor:
   UPDATE creators 
   SET user_id = (SELECT id FROM auth.users WHERE email = 'creator@email.com')
   WHERE slug = 'algum-creator';
   ```
4. Faça login com a conta do creator
5. **Esperado**: Redirecionamento automático para `/creator/dashboard`

**Teste adicional:**
- Tente acessar http://localhost:8080/admin
- **Esperado**: Redirecionamento automático de volta para `/creator/dashboard`

---

### Teste 4: Proteção de Rotas

**Teste sem autenticação:**
1. Faça logout
2. Tente acessar http://localhost:8080/admin
3. **Esperado**: Redirecionamento para `/auth`

**Teste com conta sem role:**
1. Crie uma nova conta (não admin, não creator)
2. Faça login
3. **Esperado**: Permanece na homepage `/`
4. Tente acessar `/admin` ou `/creator/dashboard`
5. **Esperado**: Redirecionamento para `/`

---

## ✅ CHECKLIST DE VERIFICAÇÃO

### Console do Browser
- [ ] Sem erros 404 para `is_user_admin`
- [ ] Sem erros 400 para `creators`
- [ ] Logs mostram `isAdmin` e `isCreator` corretamente
- [ ] Sem erros em vermelho

### Redirecionamentos
- [ ] Admin → `/admin` após login
- [ ] Creator → `/creator/dashboard` após login
- [ ] Admin não consegue acessar `/creator/dashboard`
- [ ] Creator não consegue acessar `/admin`
- [ ] Usuário sem login → `/auth` ao tentar acessar rotas protegidas

### Funcionalidade
- [ ] Admin vê todas as abas no painel
- [ ] Creator vê seu dashboard pessoal
- [ ] Nenhum usuário é redirecionado para `/` incorretamente

---

## 🐛 Se algo não funcionar

### Problema: Ainda vejo erro 404 para `is_user_admin`

**Solução**: Você não executou a migration!
1. Execute o arquivo `APPLY_AUTH_FIX.sql` no Supabase SQL Editor
2. Recarregue a página (F5)

### Problema: Ainda vejo erro 400 para `creators`

**Solução**: As políticas RLS não foram atualizadas
1. Verifique se executou TODO o script `APPLY_AUTH_FIX.sql`
2. No Supabase, vá para **Database** → **Tables** → `creators` → **Policies**
3. Deve ter uma política "Public can view creators" para SELECT

### Problema: Sou redirecionado para `/` ao invés de `/admin`

**Solução**: Sua conta não está marcada como admin
1. Execute no Supabase SQL Editor:
   ```sql
   INSERT INTO user_roles (user_id, role)
   SELECT id, 'admin'
   FROM auth.users
   WHERE email = 'SEU_EMAIL_AQUI'
   ON CONFLICT DO NOTHING;
   ```
2. Faça logout e login novamente

### Problema: Creator não é redirecionado corretamente

**Solução**: A conta não está vinculada a um creator
1. Verifique se existe um creator com `user_id` da conta:
   ```sql
   SELECT c.*, au.email
   FROM creators c
   LEFT JOIN auth.users au ON c.user_id = au.id
   WHERE au.email = 'CREATOR_EMAIL_AQUI';
   ```
2. Se não existir, vincule:
   ```sql
   UPDATE creators 
   SET user_id = (SELECT id FROM auth.users WHERE email = 'CREATOR_EMAIL')
   WHERE slug = 'creator-slug';
   ```

---

## 📞 Próximos Passos Após Testes

Quando tudo estiver funcionando:

1. ✅ Marque todos os itens do checklist
2. 📸 Tire screenshots do console mostrando os logs corretos
3. 🎉 Sistema de autenticação está funcionando!

Você pode então:
- Criar mais creators no painel admin
- Configurar os perfis dos creators
- Gerenciar campanhas e reservas
