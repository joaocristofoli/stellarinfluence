-- Create theme_presets table for storing custom theme configurations
CREATE TABLE IF NOT EXISTS theme_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    layout_type TEXT NOT NULL CHECK (layout_type IN ('minimal', 'bold', 'elegant', 'gaming', 'lifestyle', 'rock')),
    is_default BOOLEAN DEFAULT false,
    animation_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    UNIQUE(name)
);

-- Create index for faster queries
CREATE INDEX idx_theme_presets_layout ON theme_presets(layout_type);
CREATE INDEX idx_theme_presets_default ON theme_presets(is_default);

-- Enable RLS
ALTER TABLE theme_presets ENABLE ROW LEVEL SECURITY;

-- Policies for theme_presets
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

-- Insert default theme presets
INSERT INTO theme_presets (name, layout_type, is_default, animation_config) VALUES
(
    'Bold Padrão (Poder Feminino)',
    'bold',
    true,
    '{
        "enabled": true,
        "lines": {
            "count": 20,
            "width": { "min": 70, "max": 100 },
            "speed": 3,
            "opacity": 0.6,
            "glow": 10
        },
        "colors": {
            "primary": "#FF6B35",
            "secondary": "#8000FF"
        }
    }'::jsonb
),
(
    'Elegant Padrão',
    'elegant',
    true,
    '{
        "enabled": true,
        "circles": {
            "count": 8,
            "size": { "min": 200, "max": 600 },
            "speed": 20,
            "opacity": 0.2
        },
        "colors": {
            "primary": "#FFD700",
            "accent": "#FFFFFF"
        }
    }'::jsonb
),
(
    'Minimal Padrão',
    'minimal',
    true,
    '{
        "enabled": true,
        "bubbles": {
            "count": 12,
            "size": { "min": 100, "max": 300 },
            "speed": 3,
            "opacity": 0.15
        },
        "colors": {
            "primary": "#FFD700"
        }
    }'::jsonb
),
(
    'Rock Padrão',
    'rock',
    true,
    '{
        "enabled": true,
        "particles": {
            "count": 30,
            "speed": 3,
            "opacity": 0.6
        },
        "colors": {
            "fire": "#FF4500",
            "ember": "#8B0000"
        }
    }'::jsonb
),
(
    'Gaming/Tech Padrão',
    'gaming',
    true,
    '{
        "enabled": true,
        "grid": {
            "density": "medium",
            "speed": 2,
            "opacity": 0.3
        },
        "colors": {
            "primary": "#00FF88",
            "secondary": "#FF0044"
        }
    }'::jsonb
),
(
    'Lifestyle Padrão',
    'lifestyle',
    true,
    '{
        "enabled": true,
        "shapes": {
            "count": 15,
            "size": { "min": 50, "max": 150 },
            "speed": 4,
            "opacity": 0.2
        },
        "colors": {
            "primary": "#FF9B9B",
            "secondary": "#A8D8EA"
        }
    }'::jsonb
);

-- Function to automatically update updated_at timestamp
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
