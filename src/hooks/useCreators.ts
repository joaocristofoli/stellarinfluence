// src/hooks/useCreators.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Creator } from '@/types/creator';

/**
 * Hook centralizado para buscar creators/influenciadores
 * Elimina busca duplicada em StrategyForm.tsx e outros componentes
 * @param approvedOnly Se verdadeiro, retorna apenas criadores aprovados.
 */
export function useCreators(approvedOnly: boolean = false) {
    return useQuery({
        queryKey: ['creators', { approvedOnly }],
        queryFn: async () => {
            console.log('[useCreators] Fetching creators...', { approvedOnly });
            let query = supabase
                .from('creators')
                .select(`
                    id, 
                    name, 
                    image_url, 
                    category, 
                    slug, 
                    instagram_url, 
                    tiktok_url, 
                    youtube_url,
                    youtube_url,
                    approval_status,
                    admin_metadata
                `);

            if (approvedOnly) {
                query = query.eq('approval_status', 'approved');
            }

            const { data, error } = await query.order('name', { ascending: true });

            // DEBUG: Log para identificar causa raiz
            if (error) {
                console.error('[useCreators] ERROR:', error.message, error.code, error.details);
                throw error;
            }

            console.log('[useCreators] SUCCESS - Found', data?.length || 0, 'creators');
            // Cast to unknown first to avoid "neither type sufficiently overlaps" error
            return data as unknown as Creator[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutos de cache
    });
}

/**
 * Hook para buscar um creator específico por ID
 */
export function useCreator(creatorId: string | null) {
    return useQuery({
        queryKey: ['creator', creatorId],
        queryFn: async () => {
            if (!creatorId) return null;

            const { data, error } = await supabase
                .from('creators')
                .select('*')
                .eq('id', creatorId)
                .single();

            if (error) throw error;
            return data as unknown as Creator;
        },
        enabled: !!creatorId,
    });
}

/**
 * Hook para buscar creators por categoria
 */
export function useCreatorsByCategory(category: string | null) {
    return useQuery({
        queryKey: ['creators', 'category', category],
        queryFn: async () => {
            if (!category) return [];

            const { data, error } = await supabase
                .from('creators')
                .select('id, name, image_url, category, slug')
                .eq('category', category)
                .order('name', { ascending: true });

            if (error) throw error;
            return data as Creator[];
        },
        enabled: !!category,
    });
}
