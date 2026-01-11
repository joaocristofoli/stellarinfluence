-- Toledo Posts/Publications Management
-- Migration for managing news, events, and actions for Toledo prefecture

-- Create toledo_posts table
CREATE TABLE IF NOT EXISTS toledo_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT NOT NULL CHECK (categoria IN ('evento', 'acao_social', 'noticia', 'cultura')),
    imagem_url TEXT,
    data_publicacao TIMESTAMPTZ DEFAULT NOW(),
    visualizacoes INTEGER DEFAULT 0,
    alcance INTEGER DEFAULT 0,
    engajamento DECIMAL(5,2) DEFAULT 0,
    status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado', 'arquivado')),
    tipo TEXT DEFAULT 'noticia' CHECK (tipo IN ('noticia', 'campanha')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_toledo_posts_categoria ON toledo_posts(categoria);
CREATE INDEX IF NOT EXISTS idx_toledo_posts_status ON toledo_posts(status);
CREATE INDEX IF NOT EXISTS idx_toledo_posts_data ON toledo_posts(data_publicacao DESC);

-- Enable RLS
ALTER TABLE toledo_posts ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Public can view published toledo posts"
    ON toledo_posts FOR SELECT
    USING (status = 'publicado');

-- Admins can do everything
CREATE POLICY "Admins can manage toledo posts"
    ON toledo_posts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create toledo_influencers junction table (which influencers work on Toledo project)
CREATE TABLE IF NOT EXISTS toledo_influencers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(creator_id)
);

-- Enable RLS
ALTER TABLE toledo_influencers ENABLE ROW LEVEL SECURITY;

-- Public can view active toledo influencers
CREATE POLICY "Public can view active toledo influencers"
    ON toledo_influencers FOR SELECT
    USING (ativo = true);

-- Admins can manage
CREATE POLICY "Admins can manage toledo influencers"
    ON toledo_influencers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_toledo_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE toledo_posts 
    SET visualizacoes = visualizacoes + 1 
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
