-- Drop table if exists to ensure clean slate
DROP TABLE IF EXISTS theme_presets CASCADE;

-- Create a table to store theme presets that admins can customize
CREATE TABLE theme_presets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_key text UNIQUE NOT NULL,
    theme_name text NOT NULL,
    primary_color text NOT NULL,
    secondary_color text NOT NULL,
    background_color text NOT NULL,
    text_color text NOT NULL,
    font_family text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE theme_presets ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read theme presets
CREATE POLICY "Theme presets are viewable by everyone"
    ON theme_presets FOR SELECT
    USING (true);

-- Only admins can modify theme presets
CREATE POLICY "Only admins can modify theme presets"
    ON theme_presets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Insert default theme presets
INSERT INTO theme_presets (theme_key, theme_name, primary_color, secondary_color, background_color, text_color, font_family) VALUES
    ('magnetic', 'Magnetic', '#FF6B35', '#004E89', '#0A0A0A', '#FFFFFF', 'Inter'),
    ('liquid', 'Liquid', '#00D9FF', '#FF006E', '#0D1117', '#F0F0F0', 'Poppins'),
    ('cosmic', 'Cosmic', '#A855F7', '#6366F1', '#000000', '#FFFFFF', 'Space Grotesk'),
    ('neon', 'Neon', '#00FF00', '#FF00FF', '#111111', '#FFFFFF', 'Orbitron'),
    ('glitch', 'Glitch', '#00FFFF', '#FF0000', '#050505', '#E0E0E0', 'Share Tech Mono'),
    ('luxury', 'Luxury', '#D4AF37', '#1A1A1A', '#0F0F0F', '#F5F5F5', 'Cinzel'),
    ('cyber', 'Cyber', '#F72585', '#4CC9F0', '#020024', '#FFFFFF', 'Blender Pro'),
    ('nature', 'Nature', '#2E8B57', '#DAA520', '#F0FFF0', '#1A2F1A', 'Lora')
ON CONFLICT (theme_key) DO NOTHING;
