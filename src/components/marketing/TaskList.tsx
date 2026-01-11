import { useState } from 'react';
import { Plus, Check, Trash2, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StrategyTask, priorityLabels, priorityColors } from '@/types/tasks';
import { useStrategyTasks, useCreateTask, useToggleTask, useDeleteTask } from '@/hooks/useStrategyTasks';
import { useToast } from '@/hooks/use-toast';

interface TaskListProps {
    strategyId: string;
    strategyName: string;
}

export function TaskList({ strategyId, strategyName }: TaskListProps) {
    const { toast } = useToast();
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const { data: tasks = [], isLoading } = useStrategyTasks(strategyId);
    const createTask = useCreateTask();
    const toggleTask = useToggleTask();
    const deleteTask = useDeleteTask();

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;

        try {
            await createTask.mutateAsync({
                strategyId,
                title: newTaskTitle.trim(),
                description: null,
                completed: false,
                dueDate: null,
                assignedTo: null,
                priority: 'medium',
            });
            setNewTaskTitle('');
            setIsAdding(false);
            toast({ title: 'Tarefa adicionada!' });
        } catch (error) {
            toast({ title: 'Erro ao adicionar tarefa', variant: 'destructive' });
        }
    };

    const handleToggle = async (task: StrategyTask) => {
        try {
            await toggleTask.mutateAsync({
                id: task.id,
                strategyId,
                completed: !task.completed,
            });
            if (!task.completed) {
                toast({ title: '✅ Tarefa concluída!' });
            }
        } catch (error) {
            toast({ title: 'Erro ao atualizar tarefa', variant: 'destructive' });
        }
    };

    const handleDelete = async (task: StrategyTask) => {
        try {
            await deleteTask.mutateAsync({ id: task.id, strategyId });
            toast({ title: 'Tarefa removida' });
        } catch (error) {
            toast({ title: 'Erro ao remover tarefa', variant: 'destructive' });
        }
    };

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">Carregando...</div>;
    }

    return (
        <div className="space-y-3">
            {/* Progress bar */}
            {tasks.length > 0 && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{completedCount}/{tasks.length} ({progress}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Task list */}
            <div className="space-y-2">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${task.completed ? 'bg-muted/50 opacity-60' : 'bg-background hover:bg-muted/30'
                            }`}
                    >
                        <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => handleToggle(task)}
                            className="data-[state=checked]:bg-primary"
                        />
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                                    {priorityLabels[task.priority]}
                                </Badge>
                                {task.dueDate && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        {task.dueDate.toLocaleDateString('pt-BR')}
                                    </span>
                                )}
                                {task.assignedTo && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <User className="w-3 h-3" />
                                        {task.assignedTo}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(task)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Add new task */}
            {isAdding ? (
                <div className="flex gap-2">
                    <Input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Nome da tarefa..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        autoFocus
                    />
                    <Button onClick={handleAddTask} size="sm">
                        <Check className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                        Cancelar
                    </Button>
                </div>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setIsAdding(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Tarefa
                </Button>
            )}
        </div>
    );
}
