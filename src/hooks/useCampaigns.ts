import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MarketingCampaign } from '@/types/marketing';

const mapDbToCampaign = (row: any): MarketingCampaign => ({
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    description: row.description,
    startDate: row.start_date ? new Date(row.start_date) : null,
    endDate: row.end_date ? new Date(row.end_date) : null,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
});

export function useCampaigns(companyId: string | null) {
    return useQuery({
        queryKey: ['marketing_campaigns', companyId],
        queryFn: async () => {
            if (!companyId) return [];

            const { data, error } = await supabase
                .from('marketing_campaigns')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data.map(mapDbToCampaign);
        },
        enabled: !!companyId,
    });
}

export function useCreateCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (campaign: Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt'>) => {
            const { data, error } = await supabase
                .from('marketing_campaigns')
                .insert({
                    company_id: campaign.companyId,
                    name: campaign.name,
                    description: campaign.description,
                    start_date: campaign.startDate?.toISOString().split('T')[0] || null,
                    end_date: campaign.endDate?.toISOString().split('T')[0] || null,
                    status: campaign.status,
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToCampaign(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['marketing_campaigns', data.companyId] });
        },
    });
}

export function useUpdateCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...campaign }: Partial<MarketingCampaign> & { id: string; companyId: string }) => {
            const { data, error } = await supabase
                .from('marketing_campaigns')
                .update({
                    name: campaign.name,
                    description: campaign.description,
                    start_date: campaign.startDate?.toISOString().split('T')[0] || null,
                    end_date: campaign.endDate?.toISOString().split('T')[0] || null,
                    status: campaign.status,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapDbToCampaign(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['marketing_campaigns', data.companyId] });
        },
    });
}

export function useDeleteCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, companyId }: { id: string; companyId: string }) => {
            const { error } = await supabase
                .from('marketing_campaigns')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { companyId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['marketing_campaigns', data.companyId] });
            // Also invalidate strategies since they may have had campaign_id nullified
            queryClient.invalidateQueries({ queryKey: ['strategies', data.companyId] });
        },
    });
}
