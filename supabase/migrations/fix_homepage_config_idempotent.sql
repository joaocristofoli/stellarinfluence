-- MIGRATION IDEMPOTENTE: Pode ser rodada múltiplas vezes sem erro
-- Este script limpa e recria as tabelas de configuração

-- ============================================
-- 1. LIMPEZA (se necessário)
-- ============================================

-- Drop triggers
DROP TRIGGER IF EXISTS ensure_single_active_config_trigger ON homepage_config;
DROP TRIGGER IF EXISTS homepage_config_updated_at ON homepage_config;

-- Drop functions
DROP FUNCTION IF EXISTS ensure_single_active_homepage_config();
DROP FUNCTION IF EXISTS update_homepage_config_updated_at();

-- Drop table (CUIDADO: Isso apaga dados!)
-- Descomente a linha abaixo apenas se quiser recriar do zero
-- DROP TABLE IF EXISTS homepage_config CASCADE;

-- ============================================
-- 2. CRIAÇÃO DA TABELA (se não existir)
-- ============================================

CREATE TABLE IF NOT EXISTS homepage_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_active BOOLEAN DEFAULT true,
    
    -- Hero Section
    hero_title_line1 TEXT DEFAULT 'CONECTAMOS',
    hero_title_line2 TEXT DEFAULT 'CRIADORES',
    hero_title_line3 TEXT DEFAULT 'AO FUTURO',
    hero_subtitle TEXT DEFAULT 'Plataforma premium que transforma marcas em fenômenos digitais',
    hero_badge_text TEXT DEFAULT 'A Nova Era do Marketing Digital',
    
    -- Colors
    primary_color TEXT DEFAULT '#FF6B35',
    secondary_color TEXT DEFAULT '#9333EA',
    accent_color TEXT DEFAULT '#F7B801',
    
    -- CTA Buttons
    cta_primary_text TEXT DEFAULT 'Começar Agora',
    cta_secondary_text TEXT DEFAULT 'Ver Criadores',
    
    -- Animations
    enable_particle_animation BOOLEAN DEFAULT true,
    particle_count INTEGER DEFAULT 50,
    particle_size INTEGER DEFAULT 4,
    particle_speed NUMERIC DEFAULT 1.0,
    particle_opacity NUMERIC DEFAULT 0.6,
    particle_color TEXT DEFAULT '#FF6B35',
    
    enable_gradient_animation BOOLEAN DEFAULT true,
    gradient_speed NUMERIC DEFAULT 3.0,
    
    enable_scroll_indicator BOOLEAN DEFAULT true,
    
    -- Background Type: 'particles', 'gradient', 'none', 'custom'
    background_type TEXT DEFAULT 'particles',
    
    -- Layout
    hero_text_alignment TEXT DEFAULT 'center',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- 3. TRIGGERS E FUNÇÕES
-- ============================================

-- Function to ensure only one active config
CREATE OR REPLACE FUNCTION ensure_single_active_homepage_config()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE homepage_config SET is_active = false WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_active_config_trigger
    BEFORE INSERT OR UPDATE ON homepage_config
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_homepage_config();

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_homepage_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER homepage_config_updated_at
    BEFORE UPDATE ON homepage_config
    FOR EACH ROW
    EXECUTE FUNCTION update_homepage_config_updated_at();

-- ============================================
-- 4. RLS POLICIES
-- ============================================

ALTER TABLE homepage_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Homepage config is viewable by everyone" ON homepage_config;
DROP POLICY IF EXISTS "Only admins can insert homepage config" ON homepage_config;
DROP POLICY IF EXISTS "Only admins can update homepage config" ON homepage_config;
DROP POLICY IF EXISTS "Only admins can delete homepage config" ON homepage_config;

-- Create policies
CREATE POLICY "Homepage config is viewable by everyone"
    ON homepage_config FOR SELECT
    USING (is_active = true);

CREATE POLICY "Only admins can insert homepage config"
    ON homepage_config FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update homepage config"
    ON homepage_config FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete homepage config"
    ON homepage_config FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- 5. DADOS PADRÃO
-- ============================================

-- Inserir apenas se não existir nenhum registro
INSERT INTO homepage_config (
    is_active,
    hero_title_line1,
    hero_title_line2,
    hero_title_line3,
    hero_subtitle,
    hero_badge_text,
    primary_color,
    secondary_color,
    accent_color,
    cta_primary_text,
    cta_secondary_text,
    enable_particle_animation,
    particle_count,
    particle_size,
    particle_speed,
    particle_opacity,
    particle_color,
    enable_gradient_animation,
    gradient_speed,
    enable_scroll_indicator,
    background_type,
    hero_text_alignment
)
SELECT
    true,
    'CONECTAMOS',
    'CRIADORES',
    'AO FUTURO',
    'Plataforma premium que transforma marcas em fenômenos digitais',
    'A Nova Era do Marketing Digital',
    '#FF6B35',
    '#9333EA',
    '#F7B801',
    'Começar Agora',
    'Ver Criadores',
    true,
    50,
    4,
    1.0,
    0.6,
    '#FF6B35',
    true,
    3.0,
    true,
    'particles',
    'center'
WHERE NOT EXISTS (SELECT 1 FROM homepage_config LIMIT 1);

-- ============================================
-- ✅ CONCLUÍDO!
-- ============================================
