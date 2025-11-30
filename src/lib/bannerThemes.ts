import { LayoutType } from "@/types/landingTheme";

/**
 * Professional banner-specific theme presets
 * These are optimized for banners with proper contrast and visual impact
 */

export interface BannerTheme {
    name: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    overlayGradient?: string;
    textShadow?: string;
    borderColor?: string;
}

export const BANNER_THEMES: Record<LayoutType, BannerTheme> = {
    minimal: {
        name: "Minimal Elegante",
        backgroundColor: "#FFFFFF",
        textColor: "#1A1A1A",
        accentColor: "#FFD700",
        overlayGradient: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(0,0,0,0.05) 100%)",
        textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
    },
    bold: {
        name: "Poder Feminino",
        backgroundColor: "#1A0A1A",  // Dark purple-black background
        textColor: "#FFFFFF",
        accentColor: "#E91E63",  // Pink accent
        overlayGradient: "linear-gradient(135deg, rgba(233,30,99,0.15) 0%, rgba(156,39,176,0.1) 100%)",
        textShadow: "3px 3px 8px rgba(233,30,99,0.6), 0 0 20px rgba(233,30,99,0.4)",
        borderColor: "#E91E63",
    },
    elegant: {
        name: "Elegante Sofisticado",
        backgroundColor: "#0F0F1E",  // Deep dark blue  
        textColor: "#F0F0F0",
        accentColor: "#FFD700",  // Gold
        overlayGradient: "linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(16,20,35,0.9) 100%)",
        textShadow: "2px 2px 8px rgba(255,215,0,0.4), 0 0 15px rgba(255,215,0,0.2)",
        borderColor: "#FFD700",
    },
    modern: {
        name: "Moderno Vibrante",
        backgroundColor: "#1A1A2E",  // Dark blue-grey
        textColor: "#FFFFFF",
        accentColor: "#00D9FF",
        overlayGradient: "linear-gradient(135deg, rgba(0,217,255,0.15) 0%, rgba(108,99,255,0.1) 100%)",
        textShadow: "3px 3px 6px rgba(0,0,0,0.5), 0 0 15px rgba(0,217,255,0.3)",
    },
    professional: {
        name: "Profissional Corporativo",
        backgroundColor: "#001529",  // Navy
        textColor: "#FFFFFF",
        accentColor: "#FFD700",
        overlayGradient: "linear-gradient(135deg, rgba(0,21,41,0.95) 0%, rgba(0,50,100,0.9) 100%)",
        textShadow: "2px 2px 4px rgba(0,0,0,0.7), 0 0 10px rgba(255,215,0,0.2)",
        borderColor: "#FFD700",
    },
    playful: {
        name: "Divertido Criativo",
        backgroundColor: "#2D0A1F",  // Dark purple-red
        textColor: "#FFFFFF",
        accentColor: "#FFEB3B",
        overlayGradient: "linear-gradient(135deg, rgba(255,23,68,0.2) 0%, rgba(255,61,0,0.15) 100%)",
        textShadow: "3px 3px 6px rgba(0,0,0,0.6), 0 0 15px rgba(255,235,59,0.3)",
    },
    rock: {
        name: "Rock Intenso",
        backgroundColor: "#000000",
        textColor: "#FFFFFF",
        accentColor: "#FF4500",
        overlayGradient: "linear-gradient(180deg, rgba(139,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)",
        textShadow: "3px 3px 8px rgba(0,0,0,0.8), 0 0 20px rgba(255,69,0,0.5)",
    },
    lifestyle: {
        name: "Lifestyle Suave",
        backgroundColor: "#FFF5F8",  // Soft pink-white
        textColor: "#2D1B2E",
        accentColor: "#FF6B9D",
        overlayGradient: "linear-gradient(135deg, rgba(255,107,157,0.1) 0%, rgba(196,69,105,0.05) 100%)",
        textShadow: "2px 2px 4px rgba(45,27,46,0.2)",
    },
    gaming: {
        name: "Tech / Gaming",
        backgroundColor: "#0A0E27",  // Deep tech blue
        textColor: "#FFFFFF",
        accentColor: "#00FF88",
        overlayGradient: "linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(10,14,39,0.9) 100%)",
        textShadow: "3px 3px 6px rgba(0,0,0,0.6), 0 0 15px rgba(0,255,136,0.4)",
    },
};

/**
 * Get banner theme from layout type
 */
export function getBannerTheme(layoutType: LayoutType): BannerTheme {
    return BANNER_THEMES[layoutType] || BANNER_THEMES.modern;
}

/**
 * Apply theme to banner with professional defaults
 */
export function applyBannerTheme(
    layoutType: LayoutType,
    customColors?: {
        backgroundColor?: string;
        textColor?: string;
        accentColor?: string;
    }
): BannerTheme {
    const baseTheme = getBannerTheme(layoutType);

    return {
        ...baseTheme,
        backgroundColor: customColors?.backgroundColor || baseTheme.backgroundColor,
        textColor: customColors?.textColor || baseTheme.textColor,
        accentColor: customColors?.accentColor || baseTheme.accentColor,
    };
}
