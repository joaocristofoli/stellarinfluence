# Stellar Influence Studio - Vercel Deployment Guide

## 🚀 Deploy para Vercel

### 1. Pré-requisitos
- Conta na [Vercel](https://vercel.com)
- Conta no [Supabase](https://supabase.com)
- Repositório Git (GitHub, GitLab, ou Bitbucket)

### 2. Configuração do Supabase

1. Acesse seu projeto no Supabase
2. Vá em **Settings** → **API**
3. Copie:
   - `Project URL` (VITE_SUPABASE_URL)
   - `anon/public key` (VITE_SUPABASE_ANON_KEY)

### 3. Deploy na Vercel

#### Opção 1: Via Dashboard (Recomendado)

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **Add New** → **Project**
3. Importe seu repositório do Git
4. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`: Cole a URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Cole a chave anon do Supabase
5. Clique em **Deploy**

#### Opção 2: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Configurar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy para produção
vercel --prod
```

### 4. Configuração de Domínio Customizado

1. No dashboard da Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções da Vercel

### 5. Verificações Pós-Deploy

- ✅ Homepage carrega corretamente
- ✅ Admin login funciona
- ✅ Landing pages dos criadores funcionam
- ✅ Banner generator funciona
- ✅ Imagens e assets carregam

### 6. Configuração do Supabase para Produção

No Supabase, adicione a URL da Vercel às URLs autorizadas:

1. Vá em **Authentication** → **URL Configuration**
2. Adicione em **Site URL**: `https://seu-dominio.vercel.app`
3. Adicione em **Redirect URLs**: `https://seu-dominio.vercel.app/**`

### 7. Troubleshooting

**Erro de build:**
```bash
# Limpar cache e rebuild
vercel --force
```

**Variáveis de ambiente não funcionam:**
- Certifique-se que começam com `VITE_`
- Redeploy após adicionar variáveis

**404 em rotas:**
- O `vercel.json` já está configurado para SPA routing
- Certifique-se que está comitado no repositório

### 8. Atualizações Automáticas

A Vercel fará deploy automático quando você:
- Push para `main` branch → Deploy de produção
- Push para outras branches → Deploy de preview

### 9. Monitoramento

Acesse **Analytics** no dashboard da Vercel para ver:
- Visitantes
- Performance
- Erros

---

## 📝 Comandos Úteis

```bash
# Ver logs de deploy
vercel logs

# Listar deployments
vercel ls

# Remover deployment
vercel rm [deployment-url]

# Ver domínios
vercel domains ls
```

## 🔒 Segurança

- ✅ Nunca commite `.env` no Git
- ✅ Use variáveis de ambiente da Vercel
- ✅ Mantenha as chaves do Supabase seguras
- ✅ Configure RLS (Row Level Security) no Supabase
