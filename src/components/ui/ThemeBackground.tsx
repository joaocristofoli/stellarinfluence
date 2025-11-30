import { TechBackground } from "./TechBackground";
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
    const { layout, backgroundImage, backgroundBlur = 0, backgroundOpacity = 1, backgroundColor } = theme;

    // Create a modified theme with transparent background color
    const modifiedTheme = {
        ...theme,
        backgroundColor: hexToRgba(backgroundColor, backgroundOpacity)
    };

    const renderBackground = () => {
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
            case 'gaming':
            default:
                return <TechBackground theme={modifiedTheme} overlay={overlay} position={position} />;
        }
    };

    return (
        <>
            {/* Global Background Image Layer */}
            {backgroundImage && !overlay && (
                <div
                    className={`${position} inset-0 z-[-2] bg-cover bg-center bg-no-repeat transition-all duration-500`}
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        filter: `blur(${backgroundBlur}px)`,
                    }}
                />
            )}
            {renderBackground()}
        </>
    );
};
