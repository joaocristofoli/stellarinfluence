/**
 * ============================================================
 * SAFE FOLLOWER DISPLAY UTILITIES
 * ============================================================
 * Anti-fragile helpers for displaying follower counts.
 * Handles null, undefined, 0, and various string formats.
 * 
 * ROOT CAUSE CONTEXT:
 * The `total_followers` field is often NULL in DB because
 * CreatorForm saves individual platform followers but doesn't
 * aggregate them. This utility provides fallback logic.
 * ============================================================
 */

/**
 * Parse a formatted number string (e.g., "1.5M", "500K", "1,234") to number
 */
export function parseFormattedNumber(value: string | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;

    const cleanValue = value.toString().trim().toUpperCase();
    if (!cleanValue) return 0;

    // Handle K/M suffixes
    if (cleanValue.endsWith('K')) {
        return parseFloat(cleanValue.slice(0, -1)) * 1000;
    }
    if (cleanValue.endsWith('M')) {
        return parseFloat(cleanValue.slice(0, -1)) * 1000000;
    }
    if (cleanValue.endsWith('B')) {
        return parseFloat(cleanValue.slice(0, -1)) * 1000000000;
    }

    // Remove non-numeric chars except . and -
    const numeric = cleanValue.replace(/[^\d.-]/g, '');
    return parseFloat(numeric) || 0;
}

/**
 * Format a number to display string (e.g., 1500000 -> "1.5M")
 */
export function formatFollowerCount(value: number): string {
    if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return value.toString();
}

/**
 * Calculate total followers from individual platform counts
 * This is the PRIMARY fix for the bug where total_followers is NULL
 */
export function calculateTotalFollowers(creator: {
    instagram_followers?: string | number | null;
    youtube_subscribers?: string | number | null;
    tiktok_followers?: string | number | null;
    twitter_followers?: string | number | null;
    kwai_followers?: string | number | null;
}): number {
    return (
        parseFormattedNumber(creator.instagram_followers) +
        parseFormattedNumber(creator.youtube_subscribers) +
        parseFormattedNumber(creator.tiktok_followers) +
        parseFormattedNumber(creator.twitter_followers) +
        parseFormattedNumber(creator.kwai_followers)
    );
}

/**
 * SAFE DISPLAY: Get displayable follower count
 * Fallback chain: total_followers -> calculated sum -> "—"
 */
export function getSafeFollowerDisplay(creator: {
    total_followers?: string | number | null;
    instagram_followers?: string | number | null;
    youtube_subscribers?: string | number | null;
    tiktok_followers?: string | number | null;
    twitter_followers?: string | number | null;
    kwai_followers?: string | number | null;
}): string {
    // First, check if total_followers is set and valid
    const totalFromField = parseFormattedNumber(creator.total_followers);
    if (totalFromField > 0) {
        return formatFollowerCount(totalFromField);
    }

    // Fallback: calculate from individual platforms
    const calculated = calculateTotalFollowers(creator);
    if (calculated > 0) {
        return formatFollowerCount(calculated);
    }

    // Final fallback: display placeholder
    return '—';
}

/**
 * Check if creator has ANY followers data
 */
export function hasFollowersData(creator: {
    total_followers?: string | number | null;
    instagram_followers?: string | number | null;
    youtube_subscribers?: string | number | null;
    tiktok_followers?: string | number | null;
    twitter_followers?: string | number | null;
    kwai_followers?: string | number | null;
}): boolean {
    return (
        parseFormattedNumber(creator.total_followers) > 0 ||
        calculateTotalFollowers(creator) > 0
    );
}
