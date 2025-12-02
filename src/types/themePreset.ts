export interface AnimationConfig {
    enabled: boolean;

    // For Bold/Poder Feminino
    lines?: {
        count: number;
        width: { min: number; max: number };
        speed: number;
        opacity: number;
        glow: number;
    };

    // For Elegant
    circles?: {
        count: number;
        size: { min: number; max: number };
        speed: number;
        opacity: number;
    };

    // For Minimal
    bubbles?: {
        count: number;
        size: { min: number; max: number };
        speed: number;
        opacity: number;
    };

    // For Rock
    particles?: {
        count: number;
        speed: number;
        opacity: number;
    };

    // For Gaming/Tech
    grid?: {
        density: 'low' | 'medium' | 'high';
        speed: number;
        opacity: number;
    };

    // For Lifestyle
    shapes?: {
        count: number;
        size: { min: number; max: number };
        speed: number;
        opacity: number;
    };

    // Common colors
    colors: {
        primary?: string;
        secondary?: string;
        accent?: string;
        fire?: string;
        ember?: string;
    };
}

export interface ThemePreset {
    id: string;
    name: string;
    layout_type: 'minimal' | 'bold' | 'elegant' | 'gaming' | 'lifestyle' | 'rock';
    is_default: boolean;
    animation_config: AnimationConfig;
    created_at: string;
    updated_at: string;
    created_by?: string;
}
