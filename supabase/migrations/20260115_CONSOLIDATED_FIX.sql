-- =================================================================
-- STELLAR INFLUENCE STUDIO - SQL CONSOLIDADO PARA SUPABASE
-- Execute este script no Supabase Dashboard → SQL Editor
-- Data: 15 de Janeiro de 2026
-- =================================================================

-- 1. GARANTIR TABELA CREATORS EXISTE
-- (A tabela base já deve existir do 20260111_MEGA_RESTORATION.sql)

-- 2. ADICIONAR COLUNAS FALTANTES À TABELA CREATORS
ALTER TABLE creators ADD COLUMN IF NOT EXISTS background_image_url TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS gallery_urls TEXT[];
ALTER TABLE creators ADD COLUMN IF NOT EXISTS primary_platform TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS stories_views INTEGER;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS layout TEXT DEFAULT 'default';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS "primaryColor" TEXT DEFAULT '#FF6B35';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS "secondaryColor" TEXT DEFAULT '#004E89';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS kwai_url TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS kwai_active BOOLEAN DEFAULT false;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS kwai_followers INTEGER;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS profile_type TEXT DEFAULT 'influencer';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS program_name TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS reach TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS admin_metadata JSONB DEFAULT '{}'::jsonb;

-- 3. CRIAR ÍNDICES PARA CREATORS
CREATE INDEX IF NOT EXISTS idx_creators_profile_type ON creators(profile_type);
CREATE INDEX IF NOT EXISTS idx_creators_primary_platform ON creators(primary_platform);
CREATE INDEX IF NOT EXISTS idx_creators_admin_metadata ON creators USING gin(admin_metadata);

-- 4. GARANTIR RLS PARA CREATORS (permite leitura pública)
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view creators' AND tablename = 'creators') THEN
    CREATE POLICY "Anyone can view creators" ON public.creators FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create creators' AND tablename = 'creators') THEN
    CREATE POLICY "Anyone can create creators" ON public.creators FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update creators' AND tablename = 'creators') THEN
    CREATE POLICY "Anyone can update creators" ON public.creators FOR UPDATE USING (true);
  END IF;
END $$;

-- 5. CRIAR TABELA STRATEGY_TASKS (CALENDÁRIO UNIFICADO)
CREATE TABLE IF NOT EXISTS public.strategy_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE NOT NULL,
    task_date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    assigned_creator_id UUID REFERENCES public.creators(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    start_time TIME,
    end_time TIME,
    cost DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ÍNDICES PARA STRATEGY_TASKS
CREATE INDEX IF NOT EXISTS idx_strategy_tasks_strategy ON public.strategy_tasks(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_tasks_date ON public.strategy_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_strategy_tasks_creator ON public.strategy_tasks(assigned_creator_id);

-- 7. RLS PARA STRATEGY_TASKS
ALTER TABLE public.strategy_tasks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view strategy_tasks' AND tablename = 'strategy_tasks') THEN
    CREATE POLICY "Anyone can view strategy_tasks" ON public.strategy_tasks FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create strategy_tasks' AND tablename = 'strategy_tasks') THEN
    CREATE POLICY "Anyone can create strategy_tasks" ON public.strategy_tasks FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update strategy_tasks' AND tablename = 'strategy_tasks') THEN
    CREATE POLICY "Anyone can update strategy_tasks" ON public.strategy_tasks FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete strategy_tasks' AND tablename = 'strategy_tasks') THEN
    CREATE POLICY "Anyone can delete strategy_tasks" ON public.strategy_tasks FOR DELETE USING (true);
  END IF;
END $$;

-- 8. VERIFICAÇÃO FINAL
SELECT 'Migrations aplicadas com sucesso!' AS status;
SELECT COUNT(*) AS total_creators FROM creators;
SELECT COUNT(*) AS total_strategies FROM strategies;
