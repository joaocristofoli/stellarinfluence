# 🚀 Como Ativar as Configurações de Temas e Homepage

## ⚠️ Problema Atual

As configurações não estão funcionando porque **as tabelas do banco ainda não existem**. Você precisa rodar as migrations primeiro.

## ✅ Solução Rápida (Via Dashboard)

### 1. Acesse o Supabase Dashboard
- Vá em: https://supabase.com/dashboard
- Selecione seu projeto

### 2. Abra o SQL Editor
- Menu lateral → **SQL Editor**
- Clique em **New Query**

### 3. Execute a Migration 1 - Theme Presets

Copie TODO o conteúdo do arquivo:
```
supabase/migrations/20251130_create_theme_presets.sql
```

Cole no editor SQL e clique em **RUN**

### 4. Execute a Migration 2 - Homepage Config

Copie TODO o conteúdo do arquivo:
```
supabase/migrations/20251130_create_homepage_config.sql
```

Cole no editor SQL e clique em **RUN**

### 5. Verifique

No menu **Table Editor**, você deve ver:
- ✅ `theme_presets` (6 registros)
- ✅ `homepage_config` (1 registro)

## 🎉 Pronto!

Agora volte para:
- **Admin → Temas** - Configurações funcionando
- **Admin → Config** - Homepage editor funcionando

---

## 💡 Alternativa: Via CLI

Se preferir usar linha de comando:

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link ao projeto
supabase link --project-ref SEU_PROJECT_ID

# 4. Aplicar migrations
supabase db push
```

---

## 🔍 Como Verificar se Funcionou

Após rodar as migrations:

1. **Admin → Temas**
   - Clique em um tema
   - Mexa nos sliders
   - Preview deve atualizar
   - Clique em "Salvar"
   - Recarregue a página
   - Valores devem permanecer

2. **Admin → Config**
   - Mexa nos controles de partículas
   - Preview deve mostrar as partículas
   - Valores devem salvar

Se ainda não funcionar após as migrations, me avise!
