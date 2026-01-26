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
    type?: 'agency' | 'client' | 'partner'; // Phase 3
    cnpj?: string | null;
    address?: string | null;
    representativeName?: string | null;
    representativeRole?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface MarketingCampaign {
    id: string;
    companyId: string;
    name: string;
    description: string | null;
    startDate: Date | null;
    endDate: Date | null;
    status: 'planned' | 'in_progress' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}



export interface StrategyDeliverable {
    creatorId: string;
    format: string; // 'story', 'reels', etc.
    price: number;
    platform?: 'instagram' | 'tiktok' | 'youtube';
    date?: Date;
    status?: 'pending' | 'approved' | 'posted';
    quantity?: number;
}

export interface MarketingStrategy {
    id: string;
    companyId: string;
    campaignId: string | null;
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
    // Calendar fields
    startDate?: Date | null;
    endDate?: Date | null;
    contentFormat?: string; // Legacy (kept for backward compatibility during migration)
    is_draft?: boolean; // Phase 24: Ghost Mode
    // Phase 3: Detailed Financials
    mediaBudget?: number;
    agencyFeePercentage?: number;
    agencyFeeValue?: number;
    taxRate?: number;
    version?: number;
    // Multi-influencer support
    linkedCreatorIds?: string[];
    // Cart Architecture (New) 🛒
    deliverables?: StrategyDeliverable[];
    // Vinculação com eventos de panfletagem (para channelType: 'flyers')
    linkedFlyerEventIds?: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Tarefas de calendário dentro de uma estratégia
// Nota: NÃO confundir com StrategyTask (tasks.ts)
export interface CalendarTask {
    id: string;
    strategyId: string;
    taskDate: Date;
    title: string;
    description?: string;
    assignedCreatorId?: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    startTime?: string;
    endTime?: string;
    cost: number;
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

export type TransactionType = 'inflow' | 'outflow';

export interface MarketingTransaction {
    id: string;
    companyId: string;
    strategyId?: string; // Optional linkage to a strategy
    type: TransactionType;
    amount: number;
    date: Date;
    description: string;
    category?: string; // e.g., 'Deposit', 'Influencer Payment', 'Ads'
    paymentMethod?: 'pix' | 'transfer' | 'credit_card' | 'cash';
    pixKey?: string; // If 'pix'
    beneficiary?: string; // Who received the money
    status: 'pending' | 'completed' | 'cancelled';
    createdAt: Date;
}

export const channelTypeColors: Record<string, string> = {
    influencer: 'bg-pink-500',
    paid_traffic: 'bg-blue-500',
    social_media: 'bg-violet-500',
    events: 'bg-amber-500',
    flyers: 'bg-green-500',
    email_marketing: 'bg-indigo-500',
    radio: 'bg-orange-500',
    sound_car: 'bg-red-500',
    partnerships: 'bg-yellow-500',
    physical_media: 'bg-emerald-600',
    promoters: 'bg-cyan-500'
};


