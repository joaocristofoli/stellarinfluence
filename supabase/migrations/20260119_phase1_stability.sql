-- Migration: Phase 1 Stability (Financial Locks & Anti-Zombie)
-- Date: 2026-01-19
-- Description: Implements critical business logic guards directly in the database.

-- ==========================================
-- 1. FINANCIAL LOCK (Frozen Prices)
-- ==========================================

CREATE OR REPLACE FUNCTION public.check_financial_lock()
RETURNS TRIGGER AS $$
BEGIN
    -- Permitir que o PRÓPRIO status mude de 'completed' para outro (reabertura)
    -- Mas se o status JÁ ERA 'completed' e continua 'completed', e houve mudança de valores... BLOQUEIA.
    
    IF OLD.status = 'completed' AND NEW.status = 'completed' THEN
       IF (OLD.budget IS DISTINCT FROM NEW.budget) THEN
           RAISE EXCEPTION 'VIOLATION: Cannot modify budget of a completed strategy. Please reopen it first.';
       END IF;
    END IF;

    -- Se a campanha está COMPLETED, impedir adição de novas estratégias ou mudança de status para in_progress?
    -- Por enquanto, focamos na integridade do registro em si.

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_financial_lock ON public.strategies;
CREATE TRIGGER trigger_financial_lock
    BEFORE UPDATE ON public.strategies
    FOR EACH ROW
    EXECUTE FUNCTION public.check_financial_lock();


-- ==========================================
-- 2. ANTI-ZOMBIE (Auth -> Creator Draft)
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user_anti_zombie()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    existing_creator_id UUID;
BEGIN
    -- 1. Cria Profile básico (já existente no setup original, mas reforçando)
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
        NEW.raw_user_meta_data->>'avatar_url',
        'user'
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. ANTI-ZOMBIE: Cria Creator Draft IMEDIATAMENTE
    -- Verifica se já existe para evitar erro em re-signups raros
    SELECT id INTO existing_creator_id FROM public.creators WHERE user_id = NEW.id;
    
    IF existing_creator_id IS NULL THEN
        INSERT INTO public.creators (
            user_id, 
            name, 
            slug, 
            approval_status, 
            landing_theme
        )
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'Draft Creator'),
            -- Gera um slug temporário único usando o ID para evitar colisão
            'draft-' || SUBSTRING(NEW.id::text FROM 1 FOR 8),
            'pending', -- Importante: Começa como pendente/draft
            '{"primaryColor": "#FF6B35", "secondaryColor": "#004E89"}'::jsonb
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Recria o trigger da tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_anti_zombie();


-- ==========================================
-- 3. VALIDATION (Currency Preparation)
-- ==========================================
-- Adiciona coluna de moeda se não existir, default BRL
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'strategies' AND column_name = 'currency') THEN
        ALTER TABLE public.strategies ADD COLUMN currency TEXT DEFAULT 'BRL';
    END IF;
END $$;
