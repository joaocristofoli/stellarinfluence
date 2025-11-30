
export const formatNumber = (num: number | string | null | undefined): string => {
    if (num === null || num === undefined || num === '') return '';

    const n = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;

    if (isNaN(n)) return num.toString();

    if (n >= 1000000) {
        return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (n >= 1000) {
        return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return n.toString();
};

export const parseFormattedNumber = (value: string): number => {
    if (!value) return 0;

    const cleanValue = value.toUpperCase().replace(/,/g, '.');
    const multiplier = cleanValue.includes('M') ? 1000000 : cleanValue.includes('K') ? 1000 : 1;
    const num = parseFloat(cleanValue.replace(/[MK]/g, ''));

    return isNaN(num) ? 0 : Math.round(num * multiplier);
};
