-- MIGRATION IDEMPOTENTE: Pode ser rodada múltiplas vezes sem erro
-- Este script limpa e recria as tabelas de theme presets

-- ============================================
-- 1. LIMPEZA (se necessário)
-- ============================================

-- Drop indexes
DROP INDEX IF EXISTS idx_theme_presets_layout;
DROP INDEX IF EXISTS idx_theme_presets_default;

-- Drop trigger
DROP TRIGGER IF EXISTS theme_presets_updated_at ON theme_presets;

-- Drop function
DROP FUNCTION IF EXISTS update_theme_presets_updated_at();

-- Drop table (CUIDADO: Isso apaga dados!)
-- Descomente a linha abaixo apenas se quiser recriar do zero
-- DROP TABLE IF EXISTS theme_presets CASCADE;

-- ============================================
-- 2. CRIAÇÃO DA TABELA (se não existir)
-- ============================================

CREATE TABLE IF NOT EXISTS theme_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    layout_type TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    animation_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- 3. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_theme_presets_layout ON theme_presets(layout_type);
CREATE INDEX IF NOT EXISTS idx_theme_presets_default ON theme_presets(is_default) WHERE is_default = true;

-- ============================================
-- 4. TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_theme_presets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER theme_presets_updated_at
    BEFORE UPDATE ON theme_presets
    FOR EACH ROW
    EXECUTE FUNCTION update_theme_presets_updated_at();

-- ============================================
-- 5. RLS POLICIES
-- ============================================

ALTER TABLE theme_presets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Theme presets are viewable by everyone" ON theme_presets;
DROP POLICY IF EXISTS "Only admins can insert theme presets" ON theme_presets;
DROP POLICY IF EXISTS "Only admins can update theme presets" ON theme_presets;
DROP POLICY IF EXISTS "Only admins can delete theme presets" ON theme_presets;

-- Create policies
CREATE POLICY "Theme presets are viewable by everyone"
    ON theme_presets FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert theme presets"
    ON theme_presets FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update theme presets"
    ON theme_presets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete theme presets"
    ON theme_presets FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- 6. DADOS PADRÃO (inserir apenas se vazio)
-- ============================================

-- Bold Theme
INSERT INTO theme_presets (name, layout_type, is_default, animation_config)
SELECT 'Bold - Poder Feminino', 'bold', true, '{
    "enabled": true,
    "lines": {
        "count": 15,
        "speed": 3,
        "opacity": 0.6,
        "glow": 10
    },
    "colors": {
        "primary": "#FF6B35",
        "secondary": "#8000FF"
    }
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM theme_presets WHERE layout_type = 'bold');

-- Elegant Theme
INSERT INTO theme_presets (name, layout_type, is_default, animation_config)
SELECT 'Elegant - Círculos Ornamentais', 'elegant', false, '{
    "enabled": true,
    "circles": {
        "count": 8,
        "speed": 20,
        "opacity": 0.3
    },
    "colors": {
        "primary": "#D4AF37",
        "secondary": "#B8860B"
    }
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM theme_presets WHERE layout_type = 'elegant');

-- Minimal Theme
INSERT INTO theme_presets (name, layout_type, is_default, animation_config)
SELECT 'Minimal - Bolhas Sutis', 'minimal', false, '{
    "enabled": true,
    "bubbles": {
        "count": 12,
        "speed": 3,
        "opacity": 0.4
    },
    "colors": {
        "primary": "#FFFFFF"
    }
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM theme_presets WHERE layout_type = 'minimal');

-- Rock Theme
INSERT INTO theme_presets (name, layout_type, is_default, animation_config)
SELECT 'Rock - Faíscas e Fogo', 'rock', false, '{
    "enabled": true,
    "particles": {
        "count": 30,
        "speed": 5,
        "opacity": 0.7
    },
    "colors": {
        "primary": "#FF4500",
        "secondary": "#FF6347",
        "accent": "#FFD700"
    }
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM theme_presets WHERE layout_type = 'rock');

-- Gaming Theme
INSERT INTO theme_presets (name, layout_type, is_default, animation_config)
SELECT 'Gaming/Tech - Grid Tecnológico', 'gaming', false, '{
    "enabled": true,
    "grid": {
        "density": "medium",
        "speed": 2,
        "opacity": 0.5
    },
    "colors": {
        "primary": "#00FF00",
        "secondary": "#0080FF"
    }
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM theme_presets WHERE layout_type = 'gaming');

-- Lifestyle Theme
INSERT INTO theme_presets (name, layout_type, is_default, animation_config)
SELECT 'Lifestyle - Formas Orgânicas', 'lifestyle', false, '{
    "enabled": true,
    "shapes": {
        "count": 10,
        "speed": 4,
        "opacity": 0.5
    },
    "colors": {
        "primary": "#FF69B4",
        "secondary": "#FFB6C1"
    }
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM theme_presets WHERE layout_type = 'lifestyle');

-- ============================================
-- ✅ CONCLUÍDO!
-- ============================================
