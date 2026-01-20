import { MarketingStrategy } from '@/types/marketing';
import { areIntervalsOverlapping, isSameDay } from 'date-fns';

/**
 * Detecta conflitos de agenda para o MESMO creator.
 * Retorna true se houver sobreposição.
 */
export function checkOverlap(
    currentStrategy: MarketingStrategy,
    allStrategies: MarketingStrategy[]
): boolean {
    // Se não tiver data ou creator, não tem conflito
    if (!currentStrategy.startDate || !currentStrategy.linkedCreatorIds?.length) return false;

    const currentStart = new Date(currentStrategy.startDate);
    const currentEnd = currentStrategy.endDate ? new Date(currentStrategy.endDate) : currentStart;

    // Normalizar datas para início/fim do dia para garantir overlap mesmo em eventos "All Day"
    currentStart.setHours(0, 0, 0, 0);
    currentEnd.setHours(23, 59, 59, 999);

    return allStrategies.some(other => {
        // Ignora a si mesmo
        if (other.id === currentStrategy.id) return false;

        // Ignora se não tiver creators em comum
        const hasSharedCreator = other.linkedCreatorIds?.some(id =>
            currentStrategy.linkedCreatorIds.includes(id)
        );
        if (!hasSharedCreator) return false;

        if (!other.startDate) return false;

        const otherStart = new Date(other.startDate);
        const otherEnd = other.endDate ? new Date(other.endDate) : otherStart;

        otherStart.setHours(0, 0, 0, 0);
        otherEnd.setHours(23, 59, 59, 999);

        // Check Overlap
        return areIntervalsOverlapping(
            { start: currentStart, end: currentEnd },
            { start: otherStart, end: otherEnd }
        );
    });
}

/**
 * Calcula o consumo do budget total e por dia.
 */
export interface BudgetBurnStatus {
    totalBudget: number;
    usedBudget: number;
    remainingBudget: number;
    usagePercent: number;
    status: 'safe' | 'warning' | 'critical';
}

export function calculateBudgetBurn(
    strategies: MarketingStrategy[],
    totalCampaignBudget: number
): BudgetBurnStatus {
    const usedBudget = strategies.reduce((acc, s) => acc + (s.budget || 0), 0);
    const remainingBudget = totalCampaignBudget - usedBudget;

    let usagePercent = 0;
    if (totalCampaignBudget > 0) {
        usagePercent = (usedBudget / totalCampaignBudget) * 100;
    } else if (usedBudget > 0) {
        // Se não tem budget definido mas gastou, é 100% critical? Ou infito?
        // Vamos considerar 100% visualmente se não houver teto definido
        usagePercent = 100;
    }

    let status: 'safe' | 'warning' | 'critical' = 'safe';
    if (usagePercent >= 100) status = 'critical';
    else if (usagePercent > 80) status = 'warning';

    return {
        totalBudget: totalCampaignBudget,
        usedBudget,
        remainingBudget,
        usagePercent,
        status
    };
}

/**
 * Retorna o label legível para o status.
 */
export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        planned: 'Planejado',
        in_progress: 'Em Andamento',
        completed: 'Concluído',
        cancelled: 'Cancelado',
        draft: 'Rascunho'
    };
    return labels[status] || status;
}
