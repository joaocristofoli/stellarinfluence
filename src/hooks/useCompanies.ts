import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/marketing';

/**
 * Interface para tipar a resposta do banco de dados.
 * Garante type-safety no mapeamento DB -> TypeScript.
 */
interface DbCompanyRow {
    id: string;
    name: string;
    description: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    logo_url: string | null;
    city: string | null;
    state: string | null;
    cnpj: string | null;
    address: string | null;
    representative_name: string | null;
    representative_role: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Mapeia uma row do banco para o tipo Company do frontend.
 * Inclui TODOS os campos fiscais para integridade de dados.
 */
const mapDbToCompany = (row: DbCompanyRow): Company => ({
    id: row.id,
    name: row.name,
    description: row.description,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    logoUrl: row.logo_url,
    city: row.city,
    state: row.state,
    cnpj: row.cnpj,
    address: row.address,
    representativeName: row.representative_name,
    representativeRole: row.representative_role,
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
            return (data as DbCompanyRow[]).map(mapDbToCompany);
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
                    // Campos fiscais - CRIT-002 fix
                    cnpj: company.cnpj || null,
                    address: company.address || null,
                    representative_name: company.representativeName || null,
                    representative_role: company.representativeRole || null,
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToCompany(data as DbCompanyRow);
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
                    // Campos fiscais - CRIT-002 fix
                    cnpj: company.cnpj,
                    address: company.address,
                    representative_name: company.representativeName,
                    representative_role: company.representativeRole,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapDbToCompany(data as DbCompanyRow);
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
