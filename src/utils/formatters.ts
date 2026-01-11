
export const formatNumber = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null) return "0";

    // Convert string to number if needed, removing any non-numeric chars except dot/comma if necessary
    // But usually we expect a clean number or string number.
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;

    if (isNaN(num)) return "0";

    return new Intl.NumberFormat('pt-BR').format(num);
};
