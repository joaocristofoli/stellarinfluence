// Landing Page Theme Types
export type LayoutType = 'minimal' | 'bold' | 'elegant' | 'gaming' | 'lifestyle' | 'rock' | 'magnetic' | 'liquid' | 'cosmic' | 'neon' | 'glitch' | 'luxury' | 'cyber' | 'nature';
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
    enableAnimatedBackground: false,

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

// Layout presets - Premium themes with fixed aesthetics (don't change with light/dark mode)
export const LAYOUT_PRESETS: Record<LayoutType, Partial<LandingTheme>> = {
    minimal: {
        primaryColor: '#000000',
        secondaryColor: '#666666',
        backgroundColor: '#FFFFFF',
        textColor: '#1A1A1A',
        fontFamily: 'Inter',
    },
    bold: {
        primaryColor: '#FF0080', // Hot Pink
        secondaryColor: '#8000FF', // Electric Purple
        backgroundColor: '#0A0A0A', // Almost Black
        textColor: '#FFFFFF',
        fontFamily: 'Poppins',
    },
    rock: {
        primaryColor: '#FF4500', // Orange Red
        secondaryColor: '#DC143C', // Crimson
        backgroundColor: '#0D0000', // Very Dark Red/Black
        textColor: '#FFFFFF',
        fontFamily: 'Oswald',
    },
    elegant: {
        primaryColor: '#D4AF37', // Gold
        secondaryColor: '#8B7355', // Burlywood
        backgroundColor: '#1C1917', // Warm Black
        textColor: '#F5F5DC', // Light Beige
        fontFamily: 'Playfair Display',
    },
    gaming: {
        primaryColor: '#00FF88', // Neon Green
        secondaryColor: '#FF0044', // Neon Pink
        backgroundColor: '#0D0D0D', // Almost Black
        textColor: '#00FF88',
        fontFamily: 'Rajdhani',
    },
    lifestyle: {
        primaryColor: '#FF6B9D', // Soft Pink
        secondaryColor: '#C9A0DC', // Lavender
        backgroundColor: '#FFFAF0', // Floral White
        textColor: '#2D3748', // Gray 800
        fontFamily: 'Quicksand',
    },
    magnetic: {
        primaryColor: '#3B82F6', // Blue
        secondaryColor: '#8B5CF6', // Violet
        backgroundColor: '#0F172A', // Slate 900
        textColor: '#F8FAFC', // Slate 50
        fontFamily: 'Inter',
    },
    liquid: {
        primaryColor: '#EC4899', // Pink
        secondaryColor: '#06B6D4', // Cyan
        backgroundColor: '#1F2937', // Gray 800
        textColor: '#F3F4F6', // Gray 100
        fontFamily: 'Outfit',
    },
    cosmic: {
        primaryColor: '#A855F7', // Purple
        secondaryColor: '#6366F1', // Indigo
        backgroundColor: '#000000', // Pure Black
        textColor: '#FFFFFF',
        fontFamily: 'Space Grotesk',
    },
    neon: {
        primaryColor: '#39FF14', // Neon Green
        secondaryColor: '#FF10F0', // Neon Magenta
        backgroundColor: '#000000', // Pure Black
        textColor: '#39FF14',
        fontFamily: 'Orbitron',
    },
    glitch: {
        primaryColor: '#00FFFF', // Cyan
        secondaryColor: '#FF1493', // Deep Pink
        backgroundColor: '#050014', // Very Dark Blue
        textColor: '#00FFFF',
        fontFamily: 'Share Tech Mono',
    },
    luxury: {
        primaryColor: '#FFD700', // Gold
        secondaryColor: '#C0C0C0', // Silver
        backgroundColor: '#000000', // Pure Black
        textColor: '#FFD700',
        fontFamily: 'Cinzel',
    },
    cyber: {
        primaryColor: '#F72585', // Cyberpunk Pink
        secondaryColor: '#4CC9F0', // Cyberpunk Blue
        backgroundColor: '#03045E', // Dark Navy
        textColor: '#F72585',
        fontFamily: 'Blender Pro',
    },
    nature: {
        primaryColor: '#2E8B57', // Sea Green
        secondaryColor: '#CD853F', // Peru (earthy)
        backgroundColor: '#F0F8EF', // Mint Cream
        textColor: '#1A4D2E', // Dark Forest Green
        fontFamily: 'Lora',
    },
};
