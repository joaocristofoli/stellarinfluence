import { useMemo } from 'react';
import { MarketingStrategy, ChannelType } from '@/types/marketing';

/**
 * Options for configuring strategy statistics calculation
 */
export interface StrategyStatsOptions {
    /** Filtrar por mês específico */
    filterByMonth?: { year: number; month: number };
    /** Incluir estratégias sem data nos totais */
    includeUnscheduled?: boolean;
}

/**
 * Statistics for a specific marketing channel
 */
export interface ChannelStats {
    channel: ChannelType;
    count: number;
    budget: number;
    percentage: number;
}

/**
 * Comprehensive statistics about marketing strategies
 */
export interface StrategyStats {
    /** Total de estratégias */
    totalCount: number;
    /** Total de orçamento (todas) - sempre >= 0 */
    totalBudget: number;
    /** Estratégias sem data */
    unscheduledCount: number;
    unscheduledBudget: number;
    /** Estratégias agendadas */
    scheduledCount: number;
    scheduledBudget: number;
    /** Estratégias no mês (se filterByMonth) */
    monthCount: number;
    monthBudget: number;
    /** Estatísticas por canal */
    byChannel: ChannelStats[];
    /** Estatísticas por status */
    byStatus: {
        planned: number;
        in_progress: number;
        completed: number;
    };
}

/**
 * Safely extracts budget value from a strategy, handling null/undefined cases
 * @param strategy - The marketing strategy object
 * @returns The budget as a number, defaulting to 0 if null/undefined/NaN
 */
const safeBudget = (strategy: MarketingStrategy): number => {
    const budget = strategy?.budget;
    if (budget === null || budget === undefined || isNaN(budget)) {
        return 0;
    }
    return Math.max(0, budget); // Prevent negative budgets
};

/**
 * NULL-SAFE: Calculates total budget with protection against null/undefined values
 * @param strategies - Array of marketing strategies
 * @returns Total budget, guaranteed to be >= 0
 */
const calculateTotalBudget = (strategies: MarketingStrategy[]): number => {
    if (!strategies || strategies.length === 0) return 0;
    return strategies.reduce((sum, s) => sum + safeBudget(s), 0);
};

/**
 * IMPL-001: Hook centralizado para cálculo de estatísticas de estratégias
 * 
 * @description
 * Este hook fornece estatísticas resilientes sobre estratégias de marketing,
 * com proteção contra valores null/undefined e validação de dados.
 * 
 * @example
 * ```tsx
 * const stats = useStrategyStats(strategies, { filterByMonth: { year: 2026, month: 0 } });
 * console.log(stats.totalBudget, stats.monthBudget, stats.byChannel);
 * ```
 * 
 * @param strategies - Array de estratégias de marketing (pode estar vazio)
 * @param options - Opções de filtragem e configuração
 * @returns Objeto StrategyStats com todas as métricas calculadas
 */
export function useStrategyStats(
    strategies: MarketingStrategy[],
    options: StrategyStatsOptions = {}
): StrategyStats {
    const { filterByMonth, includeUnscheduled = false } = options;

    return useMemo(() => {
        // Guard: Ensure strategies is a valid array
        const safeStrategies = Array.isArray(strategies) ? strategies : [];

        // Separar por status de agendamento
        const scheduled = safeStrategies.filter(s => s?.startDate);
        const unscheduled = safeStrategies.filter(s => !s?.startDate);

        // Filtrar por mês se especificado
        let monthStrategies: MarketingStrategy[] = [];
        if (filterByMonth) {
            const monthStart = new Date(filterByMonth.year, filterByMonth.month, 1);
            const monthEnd = new Date(filterByMonth.year, filterByMonth.month + 1, 0);

            monthStrategies = scheduled.filter(s => {
                if (!s?.startDate) return false;
                const startDate = new Date(s.startDate);
                return startDate >= monthStart && startDate <= monthEnd;
            });

            // Incluir não-agendadas se solicitado
            if (includeUnscheduled) {
                monthStrategies = [...monthStrategies, ...unscheduled];
            }
        }

        // NULL-SAFE: Calcular totais usando função segura
        const totalBudget = calculateTotalBudget(safeStrategies);
        const unscheduledBudget = calculateTotalBudget(unscheduled);
        const scheduledBudget = calculateTotalBudget(scheduled);
        const monthBudget = calculateTotalBudget(monthStrategies);

        // Estatísticas por canal
        const channelMap = new Map<ChannelType, { count: number; budget: number }>();
        const targetStrategies = filterByMonth ? monthStrategies : safeStrategies;

        targetStrategies.forEach(s => {
            if (!s?.channelType) return; // Skip invalid entries

            // FIXME-PHASE1: Usar MoneyService para normalizar moedas mistas
            const rawBudget = safeBudget(s);
            // Assumindo por enquanto que tudo é BRL até migrarmos o banco para ter coluna currency
            // Futuramente: MoneyService.normalizeToBRL(rawBudget, s.currency)
            const normalizedBudget = rawBudget;

            const current = channelMap.get(s.channelType) || { count: 0, budget: 0 };
            channelMap.set(s.channelType, {
                count: current.count + 1,
                budget: current.budget + normalizedBudget,
            });
        });

        const targetBudget = filterByMonth ? monthBudget : totalBudget;
        const byChannel: ChannelStats[] = Array.from(channelMap.entries()).map(([channel, data]) => ({
            channel,
            count: data.count,
            budget: data.budget,
            percentage: targetBudget > 0 ? (data.budget / targetBudget) * 100 : 0,
        })).sort((a, b) => b.budget - a.budget);

        // Estatísticas por status
        const byStatus = {
            planned: safeStrategies.filter(s => s?.status === 'planned').length,
            in_progress: safeStrategies.filter(s => s?.status === 'in_progress').length,
            completed: safeStrategies.filter(s => s?.status === 'completed').length,
        };

        return {
            totalCount: safeStrategies.length,
            totalBudget,
            unscheduledCount: unscheduled.length,
            unscheduledBudget,
            scheduledCount: scheduled.length,
            scheduledBudget,
            monthCount: monthStrategies.length,
            monthBudget,
            byChannel,
            byStatus,
        };
    }, [strategies, filterByMonth?.year, filterByMonth?.month, includeUnscheduled]);
}
