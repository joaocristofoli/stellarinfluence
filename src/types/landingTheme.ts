// Landing Page Theme Types
export type LayoutType = 'minimal' | 'bold' | 'elegant' | 'gaming' | 'lifestyle' | 'rock';
export type HeaderStyle = 'centered' | 'left' | 'split';

export interface SectionConfig {
    enabled: boolean;
    order: number;
    config?: Record<string, any>;
}

export interface HeroConfig {
    title: string;
    subtitle: string;
    showAvatar: boolean;
    showCTA: boolean;
    ctaText: string;
    ctaLink: string;
    backgroundImage?: string;
    backgroundOverlay: number; // 0-100
    heroLayout?: 'centered' | 'split';
    mobileLayout?: 'stacked' | 'split';
    showScrollIndicator?: boolean;
}

export interface AboutConfig {
    title: string;
    content: string;
    showImages: boolean;
    images: string[];
}

export interface StatsConfig {
    showFollowers: boolean;
    showEngagement: boolean;
    showReach: boolean;
    animated: boolean;
}

export interface GalleryConfig {
    columns: number; // 2, 3, or 4
    images: string[];
    videos: string[];
    layout: 'grid' | 'masonry' | 'carousel';
}

export interface SocialConfig {
    buttonStyle: 'filled' | 'outline' | 'minimal';
    showIcons: boolean;
    showLabels: boolean;
}

export interface ContactConfig {
    showForm: boolean;
    showEmail: boolean;
    showPhone: boolean;
    formTitle: string;
    submitText: string;
}

export interface CtaConfig {
    text: string;
    link: string;
    style: 'filled' | 'outline' | 'minimal';
}

export interface LandingTheme {
    layout: LayoutType;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    backgroundImage?: string;
    backgroundBlur?: number; // px
    backgroundOpacity?: number; // 0-1
    enableAnimatedBackground?: boolean; // Toggle animated theme background
    headerStyle: HeaderStyle;

    // Sections (active and ordered)
    sections: {
        hero: SectionConfig & { config: HeroConfig };
        about: SectionConfig & { config: AboutConfig };
        stats: SectionConfig & { config: StatsConfig };
        gallery: SectionConfig & { config: GalleryConfig };
        social: SectionConfig & { config: SocialConfig };
        contact: SectionConfig & { config: ContactConfig };
        cta: SectionConfig & { config: CtaConfig };
    };

    // Global Assets
    logoImage?: string;
    faviconUrl?: string;
}

export const defaultLandingTheme: LandingTheme = {
    primaryColor: '#FF6B35',
    secondaryColor: '#004E89',
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    fontFamily: 'Inter',
    backgroundBlur: 0,
    backgroundOpacity: 1,

    layout: 'minimal',
    headerStyle: 'centered',

    sections: {
        hero: {
            enabled: true,
            order: 1,
            config: {
                title: 'Olá, sou [Nome]',
                subtitle: 'Creator de Conteúdo',
                showAvatar: true,
                showCTA: false,
                ctaText: 'Vamos trabalhar juntos',
                ctaLink: '#contact',
                backgroundOverlay: 50,
                heroLayout: 'split',
                showScrollIndicator: false,
            },
        },
        about: {
            enabled: true,
            order: 2,
            config: {
                title: 'Sobre Mim',
                content: 'Conte um pouco sobre você...',
                showImages: false,
                images: [],
            },
        },
        stats: {
            enabled: true,
            order: 3,
            config: {
                showFollowers: true,
                showEngagement: true,
                showReach: false,
                animated: true,
            },
        },
        gallery: {
            enabled: false,
            order: 4,
            config: {
                columns: 3,
                images: [],
                videos: [],
                layout: 'grid',
            },
        },
        social: {
            enabled: true,
            order: 5,
            config: {
                buttonStyle: 'filled',
                showIcons: true,
                showLabels: true,
            },
        },
        contact: {
            enabled: true,
            order: 6,
            config: {
                showForm: true,
                showEmail: true,
                showPhone: false,
                formTitle: 'Entre em Contato',
                submitText: 'Enviar Mensagem',
            },
        },
        cta: {
            enabled: true,
            order: 7,
            config: {
                text: 'Vamos trabalhar juntos',
                link: '#contact',
                style: 'filled',
            },
        },
    },
};

// Helper to get sections in order
export function getOrderedSections(theme: LandingTheme) {
    return Object.entries(theme.sections)
        .filter(([_, section]) => section.enabled)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([key, section]) => ({ key, ...section }));
}

// Layout presets
export const LAYOUT_PRESETS: Record<LayoutType, Partial<LandingTheme>> = {
    minimal: {
        primaryColor: '#000000',
        secondaryColor: '#666666',
        backgroundColor: '#FFFFFF',
        textColor: '#1A1A1A',
        fontFamily: 'Inter',
    },
    bold: {
        primaryColor: '#FF0080',
        secondaryColor: '#8000FF',
        backgroundColor: '#0A0A0A',
        textColor: '#FFFFFF',
        fontFamily: 'Poppins',
    },
    rock: {
        primaryColor: '#FF4500', // Orange Red
        secondaryColor: '#8B0000', // Dark Red
        backgroundColor: '#110505', // Very Dark Red/Black
        textColor: '#FFFFFF',
        fontFamily: 'Oswald', // Strong, condensed font often used in rock/metal
    },
    elegant: {
        primaryColor: '#C9A961',
        secondaryColor: '#2C2C2C',
        backgroundColor: '#F5F5F0',
        textColor: '#2C2C2C',
        fontFamily: 'Playfair Display',
    },
    gaming: {
        primaryColor: '#00FF88',
        secondaryColor: '#FF0044',
        backgroundColor: '#0D0D0D',
        textColor: '#FFFFFF',
        fontFamily: 'Rajdhani',
    },
    lifestyle: {
        primaryColor: '#FF9B9B',
        secondaryColor: '#A8D8EA',
        backgroundColor: '#FFF5F5',
        textColor: '#4A4A4A',
        fontFamily: 'Quicksand',
    },
};
