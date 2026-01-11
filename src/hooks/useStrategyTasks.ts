import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StrategyTask } from '@/types/tasks';

// Mapear dados do DB para o tipo
const mapDbToTask = (data: any): StrategyTask => ({
    id: data.id,
    strategyId: data.strategy_id,
    title: data.title,
    description: data.description,
    completed: data.completed,
    dueDate: data.due_date ? new Date(data.due_date) : null,
    assignedTo: data.assigned_to,
    priority: data.priority,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
});

export function useStrategyTasks(strategyId: string | null) {
    return useQuery({
        queryKey: ['strategy-tasks', strategyId],
        queryFn: async () => {
            if (!strategyId) return [];

            const { data, error } = await supabase
                .from('strategy_tasks')
                .select('*')
                .eq('strategy_id', strategyId)
                .order('created_at', { ascending: true });

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
                .from('strategy_tasks')
                .insert({
                    strategy_id: task.strategyId,
                    title: task.title,
                    description: task.description,
                    completed: task.completed,
                    due_date: task.dueDate?.toISOString().split('T')[0],
                    assigned_to: task.assignedTo,
                    priority: task.priority,
                })
                .select()
                .single();

            if (error) throw error;

            // Log activity
            await supabase.from('activity_logs').insert({
                entity_type: 'task',
                entity_id: data.id,
                action: 'created',
                new_value: task.title,
            });

            return mapDbToTask(data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['strategy-tasks', variables.strategyId] });
        },
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, strategyId, ...task }: Partial<StrategyTask> & { id: string; strategyId: string }) => {
            const { data, error } = await supabase
                .from('strategy_tasks')
                .update({
                    title: task.title,
                    description: task.description,
                    completed: task.completed,
                    due_date: task.dueDate?.toISOString().split('T')[0],
                    assigned_to: task.assignedTo,
                    priority: task.priority,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapDbToTask(data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['strategy-tasks', variables.strategyId] });
        },
    });
}

export function useToggleTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, strategyId, completed }: { id: string; strategyId: string; completed: boolean }) => {
            const { data, error } = await supabase
                .from('strategy_tasks')
                .update({ completed })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Log activity
            if (completed) {
                await supabase.from('activity_logs').insert({
                    entity_type: 'task',
                    entity_id: id,
                    action: 'task_completed',
                    new_value: data.title,
                });
            }

            return mapDbToTask(data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['strategy-tasks', variables.strategyId] });
        },
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, strategyId }: { id: string; strategyId: string }) => {
            const { error } = await supabase
                .from('strategy_tasks')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['strategy-tasks', variables.strategyId] });
        },
    });
}
