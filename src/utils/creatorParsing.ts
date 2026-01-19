/**
 * Parsing utilities for creator data
 * 
 * @description
 * These utilities handle various data formats that creators might have,
 * including follower counts with K/M suffixes and engagement rates as strings.
 */

/**
 * Parse a follower count string that may contain K/M suffixes
 * 
 * @example
 * parseFollowerCount("1.5K") // returns 1500
 * parseFollowerCount("2M")   // returns 2000000
 * parseFollowerCount("500")  // returns 500
 * parseFollowerCount(null)   // returns 0
 * 
 * @param value - String representation of follower count
 * @returns Numeric follower count, 0 if unparseable
 */
export function parseFollowerCount(value: string | null | undefined): number {
    if (!value) return 0;

    const cleaned = value.toString().trim().toUpperCase();

    // Handle empty strings
    if (!cleaned || cleaned === '-' || cleaned === 'N/A') return 0;

    // Extract numeric part and suffix
    const match = cleaned.match(/^([\d.,]+)\s*([KM])?$/);
    if (!match) return 0;

    // Parse the numeric part, handling both . and , as decimal separators
    const numStr = match[1].replace(',', '.');
    const num = parseFloat(numStr);

    if (isNaN(num)) return 0;

    // Apply suffix multiplier
    const suffix = match[2];
    if (suffix === 'K') return Math.round(num * 1000);
    if (suffix === 'M') return Math.round(num * 1000000);

    return Math.round(num);
}

/**
 * Parse an engagement rate string to a numeric value
 * 
 * @example
 * parseEngagementRate("5.2%")  // returns 5.2
 * parseEngagementRate("5,2%")  // returns 5.2 (handles Brazilian format)
 * parseEngagementRate("N/A")   // returns null
 * parseEngagementRate(null)    // returns null
 * 
 * @param value - String representation of engagement rate
 * @returns Numeric engagement rate (without % symbol), or null if unparseable
 */
export function parseEngagementRate(value: string | null | undefined): number | null {
    if (!value) return null;

    const cleaned = value.toString().trim();

    // Handle special cases
    if (!cleaned || cleaned === '-' || cleaned.toUpperCase() === 'N/A') {
        return null;
    }

    // Remove % symbol and normalize decimal separator
    const numStr = cleaned
        .replace('%', '')
        .replace(',', '.')
        .trim();

    const num = parseFloat(numStr);

    return isNaN(num) ? null : num;
}

/**
 * Format a numeric engagement rate for display
 * 
 * @example
 * formatEngagementRate(5.2)   // returns "5.2%"
 * formatEngagementRate(null)  // returns "-"
 * 
 * @param value - Numeric engagement rate
 * @returns Formatted string with % symbol
 */
export function formatEngagementRate(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
        return '-';
    }
    return `${value.toFixed(1)}%`;
}

/**
 * Format a follower count for display with K/M suffixes
 * 
 * @example
 * formatFollowerCount(1500)    // returns "1.5K"
 * formatFollowerCount(2000000) // returns "2M"
 * formatFollowerCount(500)     // returns "500"
 * 
 * @param value - Numeric follower count
 * @returns Formatted string with appropriate suffix
 */
export function formatFollowerCount(value: number | null | undefined): string {
    if (!value || isNaN(value)) return '-';

    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
}

/**
 * Check if a creator meets minimum follower requirements
 * 
 * @param creatorFollowers - Creator's total followers (string with possible suffix)
 * @param minRequired - Minimum required followers (string with possible suffix)
 * @returns True if creator meets requirement, false otherwise
 */
export function meetsFollowerRequirement(
    creatorFollowers: string | null | undefined,
    minRequired: string | null | undefined
): boolean {
    if (!minRequired) return true; // No requirement = always passes

    const creatorCount = parseFollowerCount(creatorFollowers);
    const requiredCount = parseFollowerCount(minRequired);

    // If we can't parse either, consider it a pass
    if (requiredCount === 0) return true;

    return creatorCount >= requiredCount;
}
