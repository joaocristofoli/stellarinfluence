# ⚠️ IMPORTANTE: Configurar Novo Banco de Dados Supabase

## 🔄 Banco Atualizado

As configurações foram atualizadas para o novo banco de dados:

- **URL**: https://jaefumxzgmedtkqdoblf.supabase.co
- **Project ID**: jaefumxzgmedtkqdoblf
- **Publishable Key**: sb_publishable_3bT9KOldwW1IKgl5LMY1Xw_ehLGD5Or

## 📋 PRÓXIMOS PASSOS OBRIGATÓRIOS

### 1. Executar Migration no NOVO Banco

O novo banco está vazio! Você DEVE executar o script de setup:

1. Acesse: https://jaefumxzgmedtkqdoblf.supabase.co
2. Faça login com a senha: `aez4033aA.`
3. Vá para **SQL Editor** → **New Query**
4. Abra o arquivo [`APPLY_AUTH_FIX.sql`](file:///Users/joaocris/site-zoin/stellar-influence-studio/APPLY_AUTH_FIX.sql)
5. Copie TODO o conteúdo e cole no SQL Editor
6. **IMPORTANTE**: Altere o email no script para o seu:
   ```sql
   WHERE email = 'SEU_EMAIL_AQUI'  -- ⚠️ TROQUE AQUI!
   ```
7. Clique em **RUN**

### 2. Recarregar a Aplicação

Após executar a migration:

1. O servidor dev já foi reiniciado automaticamente
2. Recarregue a página: http://localhost:8080
3. Faça login com sua conta

## ✅ O que foi criado no novo banco

O script `APPLY_AUTH_FIX.sql` irá criar:

- ✅ Tabela `profiles` - perfis de usuários
- ✅ Tabela `user_roles` - roles (admin/user)
- ✅ Tabela `creators` - criadores de conteúdo
- ✅ Função RPC `is_user_admin` - verificação de admin
- ✅ Todas as políticas RLS necessárias
- ✅ Triggers de atualização automática
- ✅ Sua conta como administrador

## 🎯 Verificação

Após executar a migration, verifique no console do navegador:

**Deve aparecer:**
```
👨‍💼 Admin check (RPC): {isAdminData: true, userId: "..."}
✅ Auth complete: {isAdmin: true, isCreator: false}
```

**NÃO deve aparecer:**
- ❌ Erros 404 ou 400
- ❌ Mensagens de erro em vermelho

## 📞 Suporte

Se tiver problemas:
1. Verifique se executou TODO o script SQL
2. Verifique se alterou o email no script
3. Verifique se fez logout/login após a migration
