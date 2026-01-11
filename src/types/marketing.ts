export type ChannelType =
    | 'influencer'
    | 'paid_traffic'
    | 'flyers'
    | 'physical_media'
    | 'events'
    | 'partnerships'
    | 'social_media'
    | 'email_marketing'
    | 'radio'
    | 'sound_car'
    | 'promoters';

export interface Company {
    id: string;
    name: string;
    description: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    logoUrl: string | null;
    city: string | null;
    state: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface MarketingStrategy {
    id: string;
    companyId: string;
    name: string;
    channelType: ChannelType;
    budget: number;
    responsible: string;
    description: string;
    howToDo: string;
    whenToDo: string;
    whyToDo: string;
    connections: string[];
    status: 'planned' | 'in_progress' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}

export const channelTypeLabels: Record<ChannelType, string> = {
    influencer: 'Influenciadores',
    paid_traffic: 'Tráfego Pago',
    flyers: 'Panfletagem',
    physical_media: 'Mídia Física',
    events: 'Eventos',
    partnerships: 'Parcerias',
    social_media: 'Redes Sociais',
    email_marketing: 'E-mail Marketing',
    radio: 'Rádio',
    sound_car: 'Carro de Som',
    promoters: 'Promotores',
};

export const channelTypeIcons: Record<ChannelType, string> = {
    influencer: '🎤',
    paid_traffic: '📈',
    flyers: '📄',
    physical_media: '🪧',
    events: '🎉',
    partnerships: '🤝',
    social_media: '📱',
    email_marketing: '📧',
    radio: '📻',
    sound_car: '🚗',
    promoters: '👥',
};

export const channelTypeColors: Record<ChannelType, string> = {
    influencer: 'bg-pink-500',
    paid_traffic: 'bg-blue-500',
    flyers: 'bg-green-500',
    physical_media: 'bg-orange-500',
    events: 'bg-purple-500',
    partnerships: 'bg-teal-500',
    social_media: 'bg-indigo-500',
    email_marketing: 'bg-yellow-500',
    radio: 'bg-red-500',
    sound_car: 'bg-cyan-500',
    promoters: 'bg-lime-500',
};
