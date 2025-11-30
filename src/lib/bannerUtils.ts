/**
 * Utility functions for banner design and color contrast
 */

/**
 * Calculate relative luminance of a color (WCAG 2.0)
 */
export function getLuminance(color: string): number {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
        const v = val / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

/**
 * Get contrasting text color (black or white) based on background
 */
export function getContrastingTextColor(backgroundColor: string): string {
    const luminance = getLuminance(backgroundColor);
    // Use white text for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard (4.5:1 for normal text)
 */
export function meetsContrastStandard(
    textColor: string,
    backgroundColor: string,
    largeText = false
): boolean {
    const ratio = getContrastRatio(textColor, backgroundColor);
    return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Get professional text color with guaranteed readability
 */
export function getProfessionalTextColor(
    backgroundColor: string,
    preferredColor?: string
): string {
    // If preferred color is provided and has good contrast, use it
    if (preferredColor && meetsContrastStandard(preferredColor, backgroundColor, true)) {
        return preferredColor;
    }

    // Otherwise, return black or white based on background luminance
    return getContrastingTextColor(backgroundColor);
}

/**
 * Add alpha channel to hex color
 */
export function addAlpha(hex: string, alpha: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
