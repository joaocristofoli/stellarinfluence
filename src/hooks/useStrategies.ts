import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MarketingStrategy, ChannelType } from '@/types/marketing';

/**
 * Interface para tipar a resposta do banco de dados.
 * Garante type-safety no mapeamento DB -> TypeScript.
 */
interface DbStrategyRow {
    id: string;
    company_id: string;
    campaign_id: string | null;
    name: string;
    channel_type: string;
    budget: number | string;
    responsible: string;
    description: string;
    how_to_do: string;
    when_to_do: string;
    why_to_do: string;
    connections: string[];
    status: 'planned' | 'in_progress' | 'completed';
    start_date: string | null;
    end_date: string | null;
    linked_creator_ids: string[] | null;
    linked_flyer_event_ids: string[] | null;
    created_at: string;
    updated_at: string;
    // Phase 24 & 25 Fields
    deliverables: any[] | null; // JSONB
    media_budget: number | null;
    agency_fee_percentage: number | null;
    tax_rate: number | null;
    flyer_schedule: any[] | null; // JSONB for panfletagem time slots
}

/**
 * Converte string de data do banco (YYYY-MM-DD) para Date object
 * SEM problema de timezone. Adiciona T12:00:00 para evitar que
 * meia-noite UTC vire dia anterior em timezones negativos.
 */
const parseDateSafe = (dateString: string | null): Date | null => {
    if (!dateString) return null;
    // Adiciona meio-dia para evitar problema de timezone
    // "2026-01-31" -> "2026-01-31T12:00:00"
    return new Date(`${dateString}T12:00:00`);
};

/**
 * Mapeia uma row do banco para o tipo MarketingStrategy do frontend.
 */
const mapDbToStrategy = (row: DbStrategyRow): MarketingStrategy => ({
    id: row.id,
    companyId: row.company_id,
    campaignId: row.campaign_id || null,
    name: row.name,
    channelType: row.channel_type as ChannelType,
    budget: Number(row.budget),
    responsible: row.responsible,
    description: row.description,
    howToDo: row.how_to_do,
    whenToDo: row.when_to_do,
    whyToDo: row.why_to_do,
    connections: row.connections || [],
    status: row.status,
    // Calendar fields - usando parseDateSafe para evitar bug de timezone
    startDate: parseDateSafe(row.start_date),
    endDate: parseDateSafe(row.end_date),
    linkedCreatorIds: row.linked_creator_ids || [],
    linkedFlyerEventIds: row.linked_flyer_event_ids || [],
    // New Fields Persistence
    deliverables: row.deliverables || [],
    flyerSchedule: row.flyer_schedule || [],
    mediaBudget: Number(row.media_budget) || Number(row.budget),
    agencyFeePercentage: Number(row.agency_fee_percentage) || 0,
    taxRate: Number(row.tax_rate) || 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
});


export function useStrategies(companyId: string | null) {
    return useQuery({
        queryKey: ['strategies', companyId],
        queryFn: async () => {
            if (!companyId) return [];

            const { data, error } = await supabase
                .from('strategies')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            // Force cast to DbStrategyRow[] because Supabase Json type is strict
            return (data as unknown as DbStrategyRow[]).map(mapDbToStrategy);
        },
        enabled: !!companyId,
    });
}

/**
 * Hook para subscription de Realtime na tabela strategies.
 * Quando qualquer usuário criar/atualizar/deletar uma estratégia,
 * o cache é invalidado automaticamente para todos.
 * 
 * @param companyId - ID da empresa para filtrar mudanças
 */
export function useStrategiesRealtime(companyId: string | null) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!companyId) return;

        // Criar channel de subscription para a tabela strategies
        const channel = supabase
            .channel(`strategies-realtime-${companyId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'strategies',
                    filter: `company_id=eq.${companyId}`,
                },
                (payload) => {
                    console.log('🔄 Realtime: Strategy change detected', payload.eventType);
                    // Invalidar cache para recarregar dados
                    queryClient.invalidateQueries({ queryKey: ['strategies', companyId] });
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Realtime: Connected to strategies channel');
                }
            });

        // Cleanup: remover subscription ao desmontar
        return () => {
            console.log('🔌 Realtime: Disconnecting from strategies channel');
            supabase.removeChannel(channel);
        };
    }, [companyId, queryClient]);
}

export function useCreateStrategy() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (strategy: Omit<MarketingStrategy, 'id' | 'createdAt' | 'updatedAt'>) => {
            const { data, error } = await supabase
                .from('strategies')
                .insert({
                    company_id: strategy.companyId,
                    campaign_id: strategy.campaignId || null,
                    name: strategy.name,
                    channel_type: strategy.channelType,
                    budget: strategy.budget,
                    responsible: strategy.responsible,
                    description: strategy.description,
                    how_to_do: strategy.howToDo,
                    when_to_do: strategy.whenToDo,
                    why_to_do: strategy.whyToDo,
                    connections: strategy.connections,
                    status: strategy.status,
                    // Calendar fields
                    start_date: strategy.startDate ? new Date(strategy.startDate).toISOString().split('T')[0] : null,
                    end_date: strategy.endDate ? new Date(strategy.endDate).toISOString().split('T')[0] : null,
                    linked_creator_ids: strategy.linkedCreatorIds || [],
                    // @ts-ignore
                    deliverables: strategy.deliverables || [],
                    // @ts-ignore
                    flyer_schedule: strategy.flyerSchedule || [],
                    media_budget: strategy.mediaBudget,
                    agency_fee_percentage: strategy.agencyFeePercentage,
                    tax_rate: strategy.taxRate,
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToStrategy(data as unknown as DbStrategyRow);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['strategies', data.companyId] });
        },
    });
}

export function useUpdateStrategy() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...strategy }: Partial<MarketingStrategy> & { id: string; companyId: string }) => {
            const { data, error } = await supabase
                .from('strategies')
                .update({
                    campaign_id: strategy.campaignId !== undefined ? (strategy.campaignId || null) : undefined,
                    name: strategy.name,
                    channel_type: strategy.channelType,
                    budget: strategy.budget,
                    responsible: strategy.responsible,
                    description: strategy.description,
                    how_to_do: strategy.howToDo,
                    when_to_do: strategy.whenToDo,
                    why_to_do: strategy.whyToDo,
                    connections: strategy.connections,
                    status: strategy.status,
                    // Calendar fields
                    start_date: strategy.startDate !== undefined
                        ? (strategy.startDate ? new Date(strategy.startDate).toISOString().split('T')[0] : null)
                        : undefined,
                    end_date: strategy.endDate !== undefined
                        ? (strategy.endDate ? new Date(strategy.endDate).toISOString().split('T')[0] : null)
                        : undefined,
                    // Persistence
                    // @ts-ignore
                    deliverables: strategy.deliverables,
                    // @ts-ignore
                    flyer_schedule: strategy.flyerSchedule,
                    media_budget: strategy.mediaBudget,
                    agency_fee_percentage: strategy.agencyFeePercentage,
                    tax_rate: strategy.taxRate,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapDbToStrategy(data as unknown as DbStrategyRow);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['strategies', data.companyId] });
        },
    });
}

export function useDeleteStrategy() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, companyId }: { id: string; companyId: string }) => {
            const { error } = await supabase
                .from('strategies')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { companyId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['strategies', data.companyId] });
        },
    });
}
