#!/bin/bash

# Script para rodar as migrations do Supabase
# Este script aplica as migrations necessárias para os sistemas de temas e homepage

echo "🚀 Aplicando migrations do Supabase..."
echo ""

# URL do seu projeto Supabase
SUPABASE_URL="${VITE_SUPABASE_URL}"
SUPABASE_SERVICE_KEY="YOUR_SERVICE_KEY_HERE" # IMPORTANTE: Use a SERVICE KEY, não a ANON KEY

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Erro: VITE_SUPABASE_URL não está definida"
    echo "Configure no arquivo .env"
    exit 1
fi

echo "📋 Migrations a serem aplicadas:"
echo "  1. theme_presets (Configurações de Temas)"
echo "  2. homepage_config (Configurações da Homepage)"
echo ""

# Instruções para o usuário
echo "⚠️  IMPORTANTE:"
echo ""
echo "Para aplicar as migrations, você precisa:"
echo ""
echo "OPÇÃO 1 - Via Supabase Dashboard (RECOMENDADO):"
echo "  1. Acesse https://supabase.com/dashboard"
echo "  2. Selecione seu projeto"
echo "  3. Vá em 'SQL Editor'"
echo "  4. Execute os arquivos nesta ordem:"
echo "     - supabase/migrations/20251130_create_theme_presets.sql"
echo "     - supabase/migrations/20251130_create_homepage_config.sql"
echo ""
echo "OPÇÃO 2 - Via Supabase CLI:"
echo "  1. Instale: npm install -g supabase"
echo "  2. Faça login: supabase login"
echo "  3. Link projeto: supabase link --project-ref SEU_PROJECT_ID"
echo "  4. Aplique: supabase db push"
echo ""
echo "Após rodar as migrations, os controles de configuração funcionarão! ✨"
