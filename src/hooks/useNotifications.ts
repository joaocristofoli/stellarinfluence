import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/tasks';

const mapDbToNotification = (data: any): Notification => ({
    id: data.id,
    title: data.title,
    message: data.message,
    type: data.type,
    read: data.read,
    entityType: data.entity_type,
    entityId: data.entity_id,
    companyId: data.company_id,
    createdAt: new Date(data.created_at),
});

export function useNotifications(limit = 20) {
    return useQuery({
        queryKey: ['notifications', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data.map(mapDbToNotification);
        },
    });
}

export function useUnreadCount() {
    return useQuery({
        queryKey: ['notifications-unread-count'],
        queryFn: async () => {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('read', false);

            if (error) throw error;
            return count || 0;
        },
    });
}

export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
    });
}

export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('read', false);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
    });
}

export async function createNotification(params: {
    title: string;
    message?: string;
    type?: Notification['type'];
    entityType?: string;
    entityId?: string;
    companyId?: string;
}) {
    const { error } = await supabase.from('notifications').insert({
        title: params.title,
        message: params.message,
        type: params.type || 'info',
        entity_type: params.entityType,
        entity_id: params.entityId,
        company_id: params.companyId,
    });

    if (error) console.error('Error creating notification:', error);
}
