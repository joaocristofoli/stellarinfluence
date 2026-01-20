// src/types/profileTypes.ts
// Definições de tipos de perfil para o sistema multi-perfil de criadores

export const PROFILE_CATEGORIES = [
    { id: 'influencer', label: 'Influenciador', icon: '📱', description: 'Instagram, TikTok, YouTube...' },
    { id: 'press', label: 'Imprensa', icon: '📰', description: 'Jornalista, Colunista, Portal' },
    { id: 'tv', label: 'Televisão', icon: '📺', description: 'Programa, Apresentador, Repórter' },
    { id: 'celebrity', label: 'Celebridade', icon: '🌟', description: 'Ator, Cantor, Artista' },
    { id: 'gossip', label: 'Fofoca/Entretenimento', icon: '🗣️', description: 'Blog de celebridades, Perfil de fofoca' },
    { id: 'podcast', label: 'Podcast/Streamer', icon: '🎙️', description: 'Podcaster, Streamer, Twitch' },
    { id: 'other', label: 'Outro', icon: '🎯', description: 'Perfil personalizado' },
    { id: 'outdoor', label: 'Mídia Exterior', icon: '🪧', description: 'Outdoor, Painel, Empena' },
    { id: 'btl', label: 'Mídia BTL', icon: '🎪', description: 'Ativação, Stand, PDV' },
] as const;

export type ProfileType = typeof PROFILE_CATEGORIES[number]['id'];

// Cores para badges de tipo de perfil (distinção visual de relance)
export const PROFILE_TYPE_COLORS: Record<ProfileType, string> = {
    influencer: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    press: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    tv: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    celebrity: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    gossip: 'bg-red-500/20 text-red-300 border-red-500/30',
    podcast: 'bg-green-500/20 text-green-300 border-green-500/30',
    other: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    outdoor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    btl: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

// Grupos de mídia para filtro inteligente
export const MEDIA_GROUPS = {
    digital: ['influencer', 'podcast', 'gossip'] as ProfileType[],
    physical: ['outdoor', 'btl'] as ProfileType[],
    traditional: ['press', 'tv', 'celebrity'] as ProfileType[],
};

// Helper para obter cor do tipo de perfil
export function getProfileTypeColor(type: ProfileType): string {
    return PROFILE_TYPE_COLORS[type] || PROFILE_TYPE_COLORS.other;
}

// Categorias por tipo de perfil
export const CATEGORIES_BY_PROFILE_TYPE: Record<ProfileType, string[]> = {
    influencer: [
        'Lifestyle', 'Fitness', 'Fashion', 'Beauty', 'Tech', 'Gaming',
        'Food', 'Travel', 'Comedy', 'Music', 'Education', 'Business',
        'Pets', 'DIY', 'Photography', 'Art', 'Sports', 'Health'
    ],
    press: [
        'Economia', 'Política', 'Cultura', 'Esportes', 'Celebridades',
        'Geral', 'Colunista Social', 'Tecnologia', 'Saúde', 'Educação',
        'Internacional', 'Meio Ambiente', 'Lifestyle'
    ],
    tv: [
        'Entretenimento', 'Jornalismo', 'Esportes', 'Variedades',
        'Reality', 'Talk Show', 'Novelas', 'Infantil', 'Culinária',
        'Documentário', 'Humor', 'Musical'
    ],
    celebrity: [
        'Música', 'Cinema', 'Teatro', 'TV', 'Modelo', 'Esporte',
        'Influência', 'Empresário(a)', 'Escritor(a)', 'Político(a)'
    ],
    gossip: [
        'Celebridades Nacionais', 'Celebridades Internacionais',
        'Novelas', 'Música', 'BBB/Reality', 'Famílias Famosas',
        'Eventos', 'Festas', 'Fofoca Geral'
    ],
    podcast: [
        'Entretenimento', 'Educação', 'True Crime', 'Comédia',
        'Negócios', 'Tecnologia', 'Esportes', 'Games', 'Cultura Pop',
        'Política', 'Lifestyle', 'Entrevistas'
    ],
    other: [
        'Geral', 'Nicho Específico', 'Corporativo', 'Institucional',
        'Evento', 'Campanha', 'Outro'
    ],
    outdoor: [
        'Outdoor Padrão', 'Front Light', 'Back Light', 'Painel LED',
        'Empena', 'Abrigo de Ônibus', 'Relógio de Rua', 'Mobiliário Urbano'
    ],
    btl: [
        'Ativação em Loja', 'Evento Corporativo', 'Feira/Stand',
        'Sampling/Amostra', 'Blitz', 'Promoção'
    ],
};

// Campos de precificação por tipo de perfil
export const PRICING_FIELDS_BY_TYPE: Record<ProfileType, { id: string; label: string; icon: string }[]> = {
    influencer: [
        { id: 'price_story', label: 'Valor por Story', icon: '📱' },
        { id: 'price_reels', label: 'Valor por Reels', icon: '🎬' },
        { id: 'price_feed_post', label: 'Valor por Post no Feed', icon: '📸' },
        { id: 'price_package_basic', label: 'Pacote Básico', icon: '📦' },
        { id: 'price_package_premium', label: 'Pacote Premium', icon: '🌟' },
    ],
    press: [
        { id: 'price_article', label: 'Valor por Matéria', icon: '📝' },
        { id: 'price_column_note', label: 'Nota em Coluna', icon: '📰' },
        { id: 'price_interview', label: 'Entrevista', icon: '🎤' },
        { id: 'price_coverage', label: 'Cobertura de Evento', icon: '📷' },
        { id: 'price_mention', label: 'Menção/Citação', icon: '💬' },
    ],
    tv: [
        { id: 'price_on_air_mention', label: 'Menção no Ar', icon: '📺' },
        { id: 'price_program_appearance', label: 'Participação em Programa', icon: '🎬' },
        { id: 'price_social_post', label: 'Post nas Redes do Programa', icon: '📱' },
        { id: 'price_interview', label: 'Entrevista', icon: '🎤' },
        { id: 'price_product_placement', label: 'Merchandising', icon: '🛍️' },
    ],
    celebrity: [
        { id: 'price_appearance', label: 'Presença/Aparição', icon: '⭐' },
        { id: 'price_post', label: 'Post nas Redes', icon: '📱' },
        { id: 'price_story', label: 'Story', icon: '📸' },
        { id: 'price_event', label: 'Evento/Show', icon: '🎭' },
        { id: 'price_endorsement', label: 'Campanha Publicitária', icon: '📺' },
    ],
    gossip: [
        { id: 'price_post', label: 'Post/Publicação', icon: '📱' },
        { id: 'price_story', label: 'Story', icon: '📸' },
        { id: 'price_exclusive', label: 'Furo/Exclusivo', icon: '🔥' },
        { id: 'price_coverage', label: 'Cobertura de Evento', icon: '📷' },
        { id: 'price_highlight', label: 'Destaque/Fixado', icon: '📌' },
    ],
    podcast: [
        { id: 'price_mention', label: 'Menção no Episódio', icon: '🎙️' },
        { id: 'price_ad_slot', label: 'Espaço Publicitário', icon: '📻' },
        { id: 'price_interview', label: 'Episódio/Entrevista', icon: '🎤' },
        { id: 'price_social_post', label: 'Post nas Redes', icon: '📱' },
        { id: 'price_sponsorship', label: 'Patrocínio de Episódio', icon: '💼' },
    ],
    other: [
        { id: 'price_primary', label: 'Serviço Principal', icon: '💰' },
        { id: 'price_secondary', label: 'Serviço Secundário', icon: '💵' },
        { id: 'price_package', label: 'Pacote', icon: '📦' },
    ],
    outdoor: [
        { id: 'price_biweek', label: 'Bi-semana', icon: '📅' },
        { id: 'price_production', label: 'Produção/Impressão', icon: '🖨️' },
        { id: 'price_monthly', label: 'Mensal', icon: '📆' },
    ],
    btl: [
        { id: 'price_day', label: 'Diária', icon: '☀️' },
        { id: 'price_event', label: 'Por Evento', icon: '🎉' },
        { id: 'price_production', label: 'Produção/Montagem', icon: '🛠️' },
    ],
};

// Labels de campos extras por tipo
export const EXTRA_FIELDS_BY_TYPE: Record<ProfileType, {
    company?: string;
    program?: string;
    reach?: string;
    location?: string;
    dimensions?: string;
    traffic?: string;
    format?: string;
    face?: string;
    lighting?: string;
    min_period?: string;
    gps_coordinates?: string;
}> = {
    influencer: {},
    press: { company: 'Veículo/Empresa', program: 'Coluna/Seção', reach: 'Alcance Mensal' },
    tv: { company: 'Emissora', program: 'Programa', reach: 'Audiência Média' },
    celebrity: { company: 'Agência/Empresário', reach: 'Alcance Total' },
    gossip: { company: 'Portal/Blog', reach: 'Alcance Mensal' },
    podcast: { company: 'Produtora/Rede', program: 'Nome do Podcast', reach: 'Downloads/Episódio' },
    other: { company: 'Empresa', reach: 'Alcance Estimado' },
    outdoor: {
        company: 'Proprietário/Operadora',
        location: 'Endereço Completo',
        dimensions: 'Dimensões (LxA)',
        traffic: 'Tráfego Diário Estimado',
        face: 'Face (A/B)',
        lighting: 'Iluminação',
        min_period: 'Período Mínimo',
        gps_coordinates: 'Coordenadas GPS'
    },
    btl: {
        company: 'Fornecedor',
        reach: 'Alcance Estimado',
        format: 'Formato (Stand/Totem/Banner)'
    },
};

// Helper para obter label do tipo de perfil
export function getProfileTypeLabel(type: ProfileType): string {
    return PROFILE_CATEGORIES.find(p => p.id === type)?.label || 'Outro';
}

// Helper para obter ícone do tipo de perfil
export function getProfileTypeIcon(type: ProfileType): string {
    return PROFILE_CATEGORIES.find(p => p.id === type)?.icon || '🎯';
}
