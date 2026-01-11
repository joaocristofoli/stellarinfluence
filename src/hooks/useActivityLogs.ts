import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ActivityLog } from '@/types/tasks';

const mapDbToLog = (data: any): ActivityLog => ({
    id: data.id,
    entityType: data.entity_type,
    entityId: data.entity_id,
    companyId: data.company_id,
    action: data.action,
    fieldChanged: data.field_changed,
    oldValue: data.old_value,
    newValue: data.new_value,
    userName: data.user_name,
    createdAt: new Date(data.created_at),
});

export function useActivityLogs(companyId?: string | null, limit = 50) {
    return useQuery({
        queryKey: ['activity-logs', companyId, limit],
        queryFn: async () => {
            let query = supabase
                .from('activity_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (companyId) {
                query = query.eq('company_id', companyId);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data.map(mapDbToLog);
        },
    });
}

export function useEntityLogs(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ['activity-logs', entityType, entityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data.map(mapDbToLog);
        },
        enabled: !!entityId,
    });
}

export async function logActivity(params: {
    entityType: 'strategy' | 'company' | 'task';
    entityId: string;
    companyId?: string;
    action: ActivityLog['action'];
    fieldChanged?: string;
    oldValue?: string;
    newValue?: string;
    userName?: string;
}) {
    const { error } = await supabase.from('activity_logs').insert({
        entity_type: params.entityType,
        entity_id: params.entityId,
        company_id: params.companyId,
        action: params.action,
        field_changed: params.fieldChanged,
        old_value: params.oldValue,
        new_value: params.newValue,
        user_name: params.userName || 'Usuário',
    });

    if (error) console.error('Error logging activity:', error);
}
