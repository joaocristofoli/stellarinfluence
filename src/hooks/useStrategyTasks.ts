import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StrategyTask } from '@/types/tasks';

/**
 * Converte string de data (YYYY-MM-DD) para Date sem problema de timezone.
 */
const parseDateSafe = (dateString: string | null): Date | null => {
    if (!dateString) return null;
    return new Date(`${dateString}T12:00:00`);
};

const mapDbToTask = (row: any): StrategyTask => ({
    id: row.id,
    strategyId: row.strategy_id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    dueDate: parseDateSafe(row.due_date),
    assignedTo: row.assigned_to,
    priority: row.priority,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
});

export function useStrategyTasks(strategyId: string | null) {
    return useQuery({
        queryKey: ['strategyTasks', strategyId],
        queryFn: async () => {
            if (!strategyId) return [];

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('strategy_id', strategyId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data.map(mapDbToTask);
        },
        enabled: !!strategyId,
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (task: Omit<StrategyTask, 'id' | 'createdAt' | 'updatedAt'>) => {
            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    strategy_id: task.strategyId,
                    title: task.title,
                    description: task.description,
                    completed: task.completed,
                    due_date: task.dueDate?.toISOString().split('T')[0] || null,
                    assigned_to: task.assignedTo,
                    priority: task.priority,
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToTask(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['strategyTasks', data.strategyId] });
        },
    });
}

export function useToggleTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, strategyId, completed }: { id: string; strategyId: string; completed: boolean }) => {
            const { data, error } = await supabase
                .from('tasks')
                .update({ completed })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { ...mapDbToTask(data), strategyId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['strategyTasks', data.strategyId] });
        },
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, strategyId }: { id: string; strategyId: string }) => {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { strategyId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['strategyTasks', data.strategyId] });
        },
    });
}
