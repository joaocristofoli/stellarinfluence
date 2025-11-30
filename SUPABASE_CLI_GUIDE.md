# 🚀 Gerenciamento Automático de Migrations - Supabase

## 📦 Instalação do Supabase CLI (Uma vez só)

### macOS:
```bash
brew install supabase/tap/supabase
```

### Alternativa (sem Homebrew):
```bash
npm install -g supabase
```

---

## ⚙️ Configuração Inicial (Uma vez só)

### 1. Link com seu projeto Supabase
```bash
supabase link --project-ref jaefumxzgmedtkqdoblf
```

Quando pedir, use:
- **Database password**: `aez4033aA.`

### 2. Verificar conexão
```bash
supabase db remote commit
```

---

## 🔄 Workflow Futuro (Sem SQL Manual!)

### Aplicar TODAS as migrations pendentes
```bash
supabase db push
```

Esse comando aplica automaticamente todas as migrations da pasta `/supabase/migrations/` que ainda não foram executadas no banco.

### Ver status das migrations
```bash
supabase migration list
```

### Criar nova migration
```bash
supabase migration new nome_da_migration
```

Isso cria um arquivo vazio em `/supabase/migrations/` onde você escreve seu SQL.

### Aplicar uma migration específica
```bash
supabase db push --include-all
```

---

## 📋 Para Aplicar AGORA (Primeira Vez)

Como você já tem o arquivo `APPLY_AUTH_FIX.sql` pronto:

### Opção 1: Aplicar via Dashboard (MAIS RÁPIDO AGORA)
1. Abra: https://jaefumxzgmedtkqdoblf.supabase.co
2. SQL Editor → Cole o conteúdo de `APPLY_AUTH_FIX.sql`
3. Execute

### Opção 2: Aplicar via CLI (MELHOR PARA FUTURO)
```bash
# Depois de instalar o CLI e fazer o link
supabase db push
```

---

## 🎯 Comandos Úteis Adicionados ao package.json

Agora você pode usar:

```bash
# Aplicar todas as migrations
npm run db:push

# Ver status das migrations
npm run db:status

# Criar nova migration
npm run db:new nome_da_migration

# Resetar banco local (desenvolvimento)
npm run db:reset
```

---

## ✅ Resumo

**AGORA (só uma vez):**
1. Execute `APPLY_AUTH_FIX.sql` no dashboard do Supabase
2. Instale o Supabase CLI: `brew install supabase/tap/supabase`
3. Faça o link: `supabase link --project-ref jaefumxzgmedtkqdoblf`

**FUTURO (para novas mudanças):**
1. Crie migration: `npm run db:new minha_mudanca`
2. Edite o arquivo criado em `/supabase/migrations/`
3. Aplique: `npm run db:push`

**Nunca mais copiar e colar SQL manualmente! 🎉**

---

## 📚 Referências

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
