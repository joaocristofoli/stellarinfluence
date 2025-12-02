import { MagneticBackground } from "./backgrounds/MagneticBackground";
import { LiquidBackground } from "./backgrounds/LiquidBackground";
import { CosmicBackground } from "./backgrounds/CosmicBackground";
import { TechBackground } from "./backgrounds/TechBackground";
import { ElegantBackground } from "./backgrounds/ElegantBackground";
import { BoldBackground } from "./backgrounds/BoldBackground";
import { MinimalBackground } from "./backgrounds/MinimalBackground";
import { LifestyleBackground } from "./backgrounds/LifestyleBackground";
import { RockBackground } from "./backgrounds/RockBackground";
import { LandingTheme } from "@/types/landingTheme";

interface ThemeBackgroundProps {
    theme: LandingTheme;
    overlay?: boolean;
    position?: 'fixed' | 'absolute';
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number = 1) {
    // Remove hash if present
    hex = hex.replace('#', '');

    // Parse r, g, b
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const ThemeBackground = ({ theme, overlay = false, position = 'fixed' }: ThemeBackgroundProps) => {
    const { layout, backgroundImage, backgroundBlur = 0, backgroundOpacity = 1, backgroundColor, enableAnimatedBackground = true } = theme;

    const renderBackground = () => {
        // If animated background is disabled, just show solid color
        if (enableAnimatedBackground === false) {
            return (
                <div
                    className={`${position} inset-0 z-[-1]`}
                    style={{ backgroundColor: backgroundImage ? 'transparent' : backgroundColor }}
                />
            );
        }

        // Create theme with adjusted background color for opacity
        const modifiedTheme = {
            ...theme,
            backgroundColor: backgroundImage ? 'transparent' : backgroundColor // Pass transparent if image exists, otherwise original
        };

        switch (layout) {
            case 'elegant':
                return <ElegantBackground theme={modifiedTheme} position={position} />;
            case 'bold':
                return <BoldBackground theme={modifiedTheme} position={position} />;
            case 'rock':
                return <RockBackground theme={modifiedTheme} position={position} />;
            case 'minimal':
                return <MinimalBackground theme={modifiedTheme} position={position} />;
            case 'lifestyle':
                return <LifestyleBackground theme={modifiedTheme} position={position} />;
            case 'magnetic':
                return <MagneticBackground theme={modifiedTheme} position={position} />;
            case 'liquid':
                return <LiquidBackground theme={modifiedTheme} position={position} />;
            case 'cosmic':
                return <CosmicBackground theme={modifiedTheme} position={position} />;
            case 'gaming':
            default:
                return <TechBackground theme={modifiedTheme} overlay={overlay} position={position} />;
        }
    };

    return (
        <>
            {/* Background Image Layer - ONLY this should have blur */}
            {backgroundImage && !overlay && (
                <div
                    className={`${position} inset-0 z-[-3]`}
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: `blur(${backgroundBlur}px)`, // Blur only affects background image
                    }}
                />
            )}

            {/* Color Overlay Layer - ONLY this should have opacity */}
            <div
                className={`${position} inset-0 z-[-2]`}
                style={{
                    backgroundColor: hexToRgba(backgroundColor, backgroundOpacity), // Opacity only affects this overlay
                }}
            />

            {/* Animated Background Layer */}
            {renderBackground()}
        </>
    );
};
