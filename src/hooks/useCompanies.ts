import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/marketing';

const mapDbToCompany = (row: any): Company => ({
    id: row.id,
    name: row.name,
    description: row.description,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    logoUrl: row.logo_url,
    city: row.city,
    state: row.state,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
});

export function useCompanies() {
    return useQuery({
        queryKey: ['companies'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data.map(mapDbToCompany);
        },
    });
}

export function useCreateCompany() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
            const { data, error } = await supabase
                .from('companies')
                .insert({
                    name: company.name,
                    description: company.description,
                    primary_color: company.primaryColor,
                    secondary_color: company.secondaryColor,
                    logo_url: company.logoUrl,
                    city: company.city,
                    state: company.state,
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToCompany(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
    });
}

export function useUpdateCompany() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...company }: Partial<Company> & { id: string }) => {
            const { data, error } = await supabase
                .from('companies')
                .update({
                    name: company.name,
                    description: company.description,
                    primary_color: company.primaryColor,
                    secondary_color: company.secondaryColor,
                    logo_url: company.logoUrl,
                    city: company.city,
                    state: company.state,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapDbToCompany(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
    });
}

export function useDeleteCompany() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('companies')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
    });
}
