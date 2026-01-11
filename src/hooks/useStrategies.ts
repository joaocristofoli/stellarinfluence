import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MarketingStrategy, ChannelType } from '@/types/marketing';

const mapDbToStrategy = (row: any): MarketingStrategy => ({
    id: row.id,
    companyId: row.company_id,
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
            return data.map(mapDbToStrategy);
        },
        enabled: !!companyId,
    });
}

export function useCreateStrategy() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (strategy: Omit<MarketingStrategy, 'id' | 'createdAt' | 'updatedAt'>) => {
            const { data, error } = await supabase
                .from('strategies')
                .insert({
                    company_id: strategy.companyId,
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
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToStrategy(data);
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
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapDbToStrategy(data);
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
