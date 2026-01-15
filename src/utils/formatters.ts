/**
 * Utilitários de formatação centralizados
 * Evita duplicação de funções em múltiplos componentes
 */

export const formatNumber = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null) return "0";

    // Convert string to number if needed, removing any non-numeric chars except dot/comma if necessary
    // But usually we expect a clean number or string number.
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;

    if (isNaN(num)) return "0";

    return new Intl.NumberFormat('pt-BR').format(num);
};

/**
 * Formata um valor numérico para moeda brasileira (BRL)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

/**
 * Formata uma data para o padrão brasileiro
 * @param date - Data a ser formatada
 * @returns String formatada (ex: "14/01/2026")
 */
export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

/**
 * Formata uma data com hora para o padrão brasileiro
 * @param date - Data a ser formatada
 * @returns String formatada (ex: "14/01/2026 às 19:30")
 */
export function formatDateTime(date: Date | string): string {
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(date));
}

/**
 * Formata um número grande de forma compacta
 * @param value - Valor numérico
 * @returns String compactada (ex: "1,2K", "3,4M")
 */
export function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        notation: 'compact',
        compactDisplay: 'short',
    }).format(value);
}

/**
 * Formata uma porcentagem
 * @param value - Valor decimal (0.15 = 15%)
 * @returns String formatada (ex: "15%")
 */
export function formatPercentage(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(value);
}
