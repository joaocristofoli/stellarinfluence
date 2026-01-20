/**
 * MoneyService.ts
 * 
 * Centraliza a lógica de conversão e formatação monetária.
 * Evita a "Cegueira Cambial" auditada na Fase 1.
 */

export type Currency = 'BRL' | 'USD' | 'EUR';

interface MonetaryValue {
    amount: number;
    currency: Currency;
}

// Em um app real, isso viria de uma API ou Context
// Por enquanto, usamos constantes hardcoded para estabilidade
const EXCHANGE_RATES: Record<Currency, number> = {
    BRL: 1,
    USD: 5.80, // Atualizado 2026 Estimate
    EUR: 6.20
};

export const MoneyService = {
    /**
     * Normaliza qualquer valor para BRL para fins de soma/totalização
     */
    normalizeToBRL(value: number, currency: Currency = 'BRL'): number {
        if (!value) return 0;
        const rate = EXCHANGE_RATES[currency];
        return value * rate;
    },

    /**
     * Formata o valor para exibição com o símbolo correto
     */
    format(value: number, currency: Currency = 'BRL'): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency,
        }).format(value);
    },

    /**
     * Retorna detalhes completos para Tooltips de conversão
     */
    getConversionDetails(value: number, currency: Currency) {
        if (currency === 'BRL') return null; // Não precisa explicar BRL -> BRL

        const rate = EXCHANGE_RATES[currency];
        const converted = value * rate;

        return {
            original: this.format(value, currency),
            rate: rate,
            converted: this.format(converted, 'BRL'),
            explanation: `Convertido de ${currency} (Cotação: ${rate.toFixed(2)})`
        };
    }
};
