import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarTask } from '@/types/marketing';

/**
 * Converte string de data (YYYY-MM-DD) para Date sem problema de timezone.
 */
const parseDateSafe = (dateString: string | null): Date => {
    if (!dateString) return new Date();
    return new Date(`${dateString}T12:00:00`);
};

const mapDbToCalendarTask = (row: any): CalendarTask => ({
    id: row.id,
    strategyId: row.strategy_id,
    taskDate: parseDateSafe(row.task_date),
    title: row.title,
    description: row.description || undefined,
    assignedCreatorId: row.assigned_creator_id || undefined,
    status: row.status,
    startTime: row.start_time || undefined,
    endTime: row.end_time || undefined,
    cost: Number(row.cost) || 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
});

// Buscar tarefas de calendário de uma estratégia específica
export function useCalendarTasks(strategyId: string | null) {
    return useQuery({
        queryKey: ['calendarTasks', strategyId],
        queryFn: async () => {
            if (!strategyId) return [];

            const { data, error } = await supabase
                .from('strategy_tasks')
                .select('*')
                .eq('strategy_id', strategyId)
                .order('task_date', { ascending: true });

            if (error) throw error;
            return data.map(mapDbToCalendarTask);
        },
        enabled: !!strategyId,
    });
}

// Buscar todas as tarefas de calendário de uma empresa
export function useAllCalendarTasks(companyId: string | null) {
    return useQuery({
        queryKey: ['allCalendarTasks', companyId],
        queryFn: async () => {
            if (!companyId) return [];

            const { data, error } = await supabase
                .from('strategy_tasks')
                .select(`
                    *,
                    strategies!inner(company_id, name, channel_type, budget)
                `)
                .eq('strategies.company_id', companyId)
                .order('task_date', { ascending: true });

            if (error) throw error;

            return data.map(row => ({
                ...mapDbToCalendarTask(row),
                strategyName: row.strategies?.name,
                channelType: row.strategies?.channel_type,
                strategyBudget: row.strategies?.budget,
            }));
        },
        enabled: !!companyId,
    });
}

// Buscar tarefas por range de datas (para view mensal/semanal)
export function useCalendarTasksByDateRange(
    companyId: string | null,
    startDate: string,
    endDate: string
) {
    return useQuery({
        queryKey: ['calendarTasksByDate', companyId, startDate, endDate],
        queryFn: async () => {
            if (!companyId) return [];

            const { data, error } = await supabase
                .from('strategy_tasks')
                .select(`
                    *,
                    strategies!inner(company_id, name, channel_type),
                    creators:assigned_creator_id(id, name, image_url)
                `)
                .eq('strategies.company_id', companyId)
                .gte('task_date', startDate)
                .lte('task_date', endDate)
                .order('task_date', { ascending: true });

            if (error) throw error;

            return data.map(row => ({
                ...mapDbToCalendarTask(row),
                strategyName: row.strategies?.name,
                channelType: row.strategies?.channel_type,
                creator: row.creators || null,
            }));
        },
        enabled: !!companyId && !!startDate && !!endDate,
    });
}

export function useCreateCalendarTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (task: Omit<CalendarTask, 'id' | 'createdAt' | 'updatedAt'>) => {
            const { data, error } = await supabase
                .from('strategy_tasks')
                .insert({
                    strategy_id: task.strategyId,
                    task_date: task.taskDate instanceof Date
                        ? task.taskDate.toISOString().split('T')[0]
                        : task.taskDate,
                    title: task.title,
                    description: task.description || null,
                    assigned_creator_id: task.assignedCreatorId || null,
                    status: task.status,
                    start_time: task.startTime || null,
                    end_time: task.endTime || null,
                    cost: task.cost || 0,
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToCalendarTask(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['calendarTasks', data.strategyId] });
            queryClient.invalidateQueries({ queryKey: ['allCalendarTasks'] });
            queryClient.invalidateQueries({ queryKey: ['calendarTasksByDate'] });
        },
    });
}

export function useUpdateCalendarTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...task }: Partial<CalendarTask> & { id: string; strategyId: string }) => {
            const { data, error } = await supabase
                .from('strategy_tasks')
                .update({
                    task_date: task.taskDate instanceof Date
                        ? task.taskDate.toISOString().split('T')[0]
                        : task.taskDate,
                    title: task.title,
                    description: task.description,
                    assigned_creator_id: task.assignedCreatorId,
                    status: task.status,
                    start_time: task.startTime,
                    end_time: task.endTime,
                    cost: task.cost,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapDbToCalendarTask(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['calendarTasks', data.strategyId] });
            queryClient.invalidateQueries({ queryKey: ['allCalendarTasks'] });
            queryClient.invalidateQueries({ queryKey: ['calendarTasksByDate'] });
        },
    });
}

export function useDeleteCalendarTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, strategyId }: { id: string; strategyId: string }) => {
            const { error } = await supabase
                .from('strategy_tasks')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { strategyId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['calendarTasks', data.strategyId] });
            queryClient.invalidateQueries({ queryKey: ['allCalendarTasks'] });
            queryClient.invalidateQueries({ queryKey: ['calendarTasksByDate'] });
        },
    });
}
