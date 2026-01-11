// Types for advanced project management features

export interface StrategyTask {
    id: string;
    strategyId: string;
    title: string;
    description: string | null;
    completed: boolean;
    dueDate: Date | null;
    assignedTo: string | null;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
}

export interface ActivityLog {
    id: string;
    entityType: 'strategy' | 'company' | 'task';
    entityId: string;
    companyId: string | null;
    action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'task_completed';
    fieldChanged: string | null;
    oldValue: string | null;
    newValue: string | null;
    userName: string;
    createdAt: Date;
}

export interface Notification {
    id: string;
    title: string;
    message: string | null;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    entityType: string | null;
    entityId: string | null;
    companyId: string | null;
    createdAt: Date;
}

export const priorityLabels: Record<StrategyTask['priority'], string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
};

export const priorityColors: Record<StrategyTask['priority'], string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
};

export const actionLabels: Record<ActivityLog['action'], string> = {
    created: 'criou',
    updated: 'atualizou',
    deleted: 'removeu',
    status_changed: 'alterou status de',
    task_completed: 'concluiu tarefa em',
};
