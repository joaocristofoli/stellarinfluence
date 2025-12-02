-- Add comprehensive demographic fields to creators table

-- Personal Demographics
ALTER TABLE creators ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Brasil';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Audience Demographics (Age Distribution)
ALTER TABLE creators ADD COLUMN IF NOT EXISTS audience_type TEXT; -- Predominant type
ALTER TABLE creators ADD COLUMN IF NOT EXISTS audience_age_13_17 NUMERIC(5,2) DEFAULT 0 CHECK (audience_age_13_17 >= 0 AND audience_age_13_17 <= 100);
ALTER TABLE creators ADD COLUMN IF NOT EXISTS audience_age_18_24 NUMERIC(5,2) DEFAULT 0 CHECK (audience_age_18_24 >= 0 AND audience_age_18_24 <= 100);
ALTER TABLE creators ADD COLUMN IF NOT EXISTS audience_age_25_34 NUMERIC(5,2) DEFAULT 0 CHECK (audience_age_25_34 >= 0 AND audience_age_25_34 <= 100);
ALTER TABLE creators ADD COLUMN IF NOT EXISTS audience_age_35_44 NUMERIC(5,2) DEFAULT 0 CHECK (audience_age_35_44 >= 0 AND audience_age_35_44 <= 100);
ALTER TABLE creators ADD COLUMN IF NOT EXISTS audience_age_45_plus NUMERIC(5,2) DEFAULT 0 CHECK (audience_age_45_plus >= 0 AND audience_age_45_plus <= 100);

-- Audience Demographics (Gender Distribution)
ALTER TABLE creators ADD COLUMN IF NOT EXISTS audience_male_percent NUMERIC(5,2) DEFAULT 0 CHECK (audience_male_percent >= 0 AND audience_male_percent <= 100);
ALTER TABLE creators ADD COLUMN IF NOT EXISTS audience_female_percent NUMERIC(5,2) DEFAULT 0 CHECK (audience_female_percent >= 0 AND audience_female_percent <= 100);
ALTER TABLE creators ADD COLUMN IF NOT EXISTS audience_other_percent NUMERIC(5,2) DEFAULT 0 CHECK (audience_other_percent >= 0 AND audience_other_percent <= 100);

-- Content Segmentation
ALTER TABLE creators ADD COLUMN IF NOT EXISTS content_niche TEXT[]; -- Array of niches
ALTER TABLE creators ADD COLUMN IF NOT EXISTS political_ideology TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS content_language TEXT[] DEFAULT ARRAY['Português'];

-- Performance Metrics (per platform)
ALTER TABLE creators ADD COLUMN IF NOT EXISTS instagram_engagement_rate NUMERIC(5,2);
ALTER TABLE creators ADD COLUMN IF NOT EXISTS tiktok_engagement_rate NUMERIC(5,2);
ALTER TABLE creators ADD COLUMN IF NOT EXISTS youtube_engagement_rate NUMERIC(5,2);
ALTER TABLE creators ADD COLUMN IF NOT EXISTS twitter_engagement_rate NUMERIC(5,2);
ALTER TABLE creators ADD COLUMN IF NOT EXISTS kwai_engagement_rate NUMERIC(5,2);

-- Average Metrics
ALTER TABLE creators ADD COLUMN IF NOT EXISTS average_views INTEGER;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS average_likes INTEGER;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS average_comments INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN creators.gender IS 'Gênero do criador: Masculino, Feminino, Não-binário, Prefere não dizer';
COMMENT ON COLUMN creators.audience_type IS 'Tipo predominante de audiência: Jovem Adulto, Adolescente, Adulto, Sênior';
COMMENT ON COLUMN creators.political_ideology IS 'Ideologia política: Esquerda, Centro-Esquerda, Centro, Centro-Direita, Direita, Apartidário, Não se aplica';
COMMENT ON COLUMN creators.content_niche IS 'Nichos de conteúdo: Lifestyle, Tech, Beauty, Fitness, Gaming, Food, Travel, Fashion, Education, Business';
