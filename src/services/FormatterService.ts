/**
 * ============================================================
 * FORMATTER SERVICE
 * ============================================================
 * Centralized formatting utilities for the entire application.
 * All formatting should go through this service to ensure
 * consistency across Admin, Marketing, and Creator modules.
 * 
 * Principles:
 * - Pure functions (no side effects)
 * - Locale-aware (pt-BR by default)
 * - Type-safe
 * ============================================================
 */

// ============================================================
// LOCALE CONFIGURATION
// ============================================================
const LOCALE = 'pt-BR';
const CURRENCY = 'BRL';

// ============================================================
// CURRENCY FORMATTING
// ============================================================

/**
 * Format a number as Brazilian Real currency
 * @param value - Numeric value (in Reais, not centavos)
 * @param options - Optional formatting options
 * @returns Formatted string like "R$ 1.234,56"
 */
export function formatCurrency(
    value: number | string | null | undefined,
    options?: { showSymbol?: boolean; decimals?: number }
): string {
    const { showSymbol = true, decimals = 2 } = options || {};

    const num = parseNumber(value);

    if (showSymbol) {
        return new Intl.NumberFormat(LOCALE, {
            style: 'currency',
            currency: CURRENCY,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(num);
    }

    return new Intl.NumberFormat(LOCALE, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

/**
 * Parse a formatted currency string back to number
 * @param value - String like "R$ 1.234,56" or "1234.56"
 * @returns Numeric value
 */
export function parseCurrency(value: string | number | null | undefined): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    // Remove currency symbol and whitespace
    let cleaned = value.toString().replace(/R\$\s?/gi, '').trim();

    // Brazilian format: 1.234,56 -> 1234.56
    // Remove thousand separators (.) and replace decimal comma with dot
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');

    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

// ============================================================
// NUMBER FORMATTING
// ============================================================

/**
 * Format a number with thousand separators
 * @param value - Numeric value
 * @param decimals - Number of decimal places
 * @returns Formatted string like "1.234.567"
 */
export function formatNumber(
    value: number | string | null | undefined,
    decimals: number = 0
): string {
    const num = parseNumber(value);

    return new Intl.NumberFormat(LOCALE, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

/**
 * Format large numbers in compact form
 * @param value - Numeric value
 * @returns Formatted string like "1,2K" or "3,4M"
 */
export function formatCompactNumber(value: number | string | null | undefined): string {
    const num = parseNumber(value);

    return new Intl.NumberFormat(LOCALE, {
        notation: 'compact',
        compactDisplay: 'short',
    }).format(num);
}

/**
 * Parse a formatted number string back to number
 * Handles both Brazilian (1.234,56) and American (1,234.56) formats
 */
export function parseNumber(value: string | number | null | undefined): number {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (!value) return 0;

    const str = value.toString().trim();
    if (!str) return 0;

    // Detect format: if last separator is comma, it's Brazilian
    const lastDot = str.lastIndexOf('.');
    const lastComma = str.lastIndexOf(',');

    let cleaned: string;

    if (lastComma > lastDot) {
        // Brazilian format: 1.234,56
        cleaned = str.replace(/\./g, '').replace(',', '.');
    } else {
        // American format: 1,234.56
        cleaned = str.replace(/,/g, '');
    }

    // Remove any remaining non-numeric chars except dot and minus
    cleaned = cleaned.replace(/[^\d.-]/g, '');

    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

// ============================================================
// PERCENTAGE FORMATTING
// ============================================================

/**
 * Format a value as percentage
 * @param value - Decimal value (0.15 = 15%) or direct percentage (15 = 15%)
 * @param isDecimal - If true, treats 0.15 as 15%. If false, treats 15 as 15%
 * @returns Formatted string like "15%" or "3,5%"
 */
export function formatPercentage(
    value: number | string | null | undefined,
    options?: { isDecimal?: boolean; decimals?: number }
): string {
    const { isDecimal = false, decimals = 1 } = options || {};

    const num = parseNumber(value);

    if (isDecimal) {
        // Convert 0.15 to 15%
        return new Intl.NumberFormat(LOCALE, {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(num);
    }

    // Treat as direct percentage (15 = 15%)
    return `${formatNumber(num, decimals)}%`;
}

/**
 * Parse a percentage string back to number
 * @param value - String like "15%" or "3,5%"
 * @returns Numeric value (15 or 3.5)
 */
export function parsePercentage(value: string | number | null | undefined): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    const cleaned = value.toString().replace(/%/g, '').trim();
    return parseNumber(cleaned);
}

// ============================================================
// DATE FORMATTING
// ============================================================

/**
 * Format a date to Brazilian format
 * @param date - Date object or string
 * @returns Formatted string like "14/01/2026"
 */
export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return '—';

    try {
        return new Intl.DateTimeFormat(LOCALE).format(new Date(date));
    } catch {
        return '—';
    }
}

/**
 * Format a date with time
 * @param date - Date object or string
 * @returns Formatted string like "14/01/2026 às 19:30"
 */
export function formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return '—';

    try {
        return new Intl.DateTimeFormat(LOCALE, {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(new Date(date));
    } catch {
        return '—';
    }
}

// ============================================================
// MASKING UTILITIES (for real-time input formatting)
// ============================================================

/**
 * Apply currency mask to input value
 * Used by MaskedInput component for real-time formatting
 * @param input - Raw input string
 * @returns Object with formatted display value and numeric value
 */
export function applyCurrencyMask(input: string): { display: string; value: number } {
    // Remove all non-digits
    const digitsOnly = input.replace(/\D/g, '');

    if (!digitsOnly) {
        return { display: '', value: 0 };
    }

    // Convert to centavos then to reais
    const centavos = parseInt(digitsOnly, 10);
    const reais = centavos / 100;

    return {
        display: formatCurrency(reais),
        value: reais,
    };
}

/**
 * Apply number mask with thousand separators
 */
export function applyNumberMask(input: string): { display: string; value: number } {
    // Remove all non-digits
    const digitsOnly = input.replace(/\D/g, '');

    if (!digitsOnly) {
        return { display: '', value: 0 };
    }

    const num = parseInt(digitsOnly, 10);

    return {
        display: formatNumber(num),
        value: num,
    };
}

/**
 * Apply percentage mask (0-100)
 */
export function applyPercentageMask(input: string): { display: string; value: number } {
    // Allow digits and one decimal point
    let cleaned = input.replace(/[^\d,]/g, '');

    // Replace comma with dot for parsing
    const parts = cleaned.split(',');
    if (parts.length > 2) {
        cleaned = parts[0] + ',' + parts.slice(1).join('');
    }

    // Limit to 100
    const num = parseNumber(cleaned.replace(',', '.'));
    const clamped = Math.min(100, Math.max(0, num));

    if (!cleaned) {
        return { display: '', value: 0 };
    }

    return {
        display: cleaned + (cleaned.includes(',') ? '' : '%'),
        value: clamped,
    };
}

// ============================================================
// SAFE DISPLAY UTILITIES
// ============================================================

/**
 * Safely display a value with fallback
 */
export function safeDisplay(
    value: any,
    formatter: (v: any) => string,
    fallback: string = '—'
): string {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    try {
        const formatted = formatter(value);
        return formatted || fallback;
    } catch {
        return fallback;
    }
}

// ============================================================
// HOOK FOR REACT COMPONENTS
// ============================================================

/**
 * React hook that provides all formatting utilities
 * @example
 * const { formatCurrency, formatPercentage } = useFormatter();
 */
export function useFormatter() {
    return {
        formatCurrency,
        formatNumber,
        formatCompactNumber,
        formatPercentage,
        formatDate,
        formatDateTime,
        parseCurrency,
        parseNumber,
        parsePercentage,
        applyCurrencyMask,
        applyNumberMask,
        applyPercentageMask,
        safeDisplay,
    };
}

export default {
    formatCurrency,
    formatNumber,
    formatCompactNumber,
    formatPercentage,
    formatDate,
    formatDateTime,
    parseCurrency,
    parseNumber,
    parsePercentage,
    applyCurrencyMask,
    applyNumberMask,
    applyPercentageMask,
    safeDisplay,
    useFormatter,
};
