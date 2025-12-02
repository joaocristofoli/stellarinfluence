
export const formatNumber = (num: number | string | null | undefined): string => {
    if (num === null || num === undefined || num === '') return '';

    const n = typeof num === 'string' ? parseFloat(num.replace(/\./g, '').replace(/,/g, '.')) : num;

    if (isNaN(n)) return num.toString();

    return new Intl.NumberFormat('pt-BR').format(n);
};

export const parseFormattedNumber = (value: string): number => {
    if (!value) return 0;

    // Remove dots (thousand separators) and replace comma with dot (decimal) if any
    const cleanValue = value.replace(/\./g, '').replace(/,/g, '.');
    const num = parseFloat(cleanValue);

    return isNaN(num) ? 0 : num;
};
