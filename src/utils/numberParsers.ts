/**
 * Parses k/m/b string format into number
 * e.g. "1.5M" -> 1500000
 * e.g. "500K" -> 500000
 */
export function parseFollowerCount(countStr: string | undefined): number {
    if (!countStr) return 0;

    // Remove non-numeric/alpha chars (like commas, spaces)
    const cleanStr = countStr.toUpperCase().replace(/[^0-9.KMB]/g, '');

    const multiplier = {
        'K': 1000,
        'M': 1000000,
        'B': 1000000000
    };

    const suffix = cleanStr.slice(-1) as keyof typeof multiplier;
    if (multiplier[suffix]) {
        const num = parseFloat(cleanStr.slice(0, -1));
        return num * multiplier[suffix];
    }

    return parseFloat(cleanStr) || 0;
}
