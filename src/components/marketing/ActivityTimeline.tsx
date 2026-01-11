import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, FileText, Building2, CheckSquare } from 'lucide-react';
import { ActivityLog, actionLabels } from '@/types/tasks';
import { useActivityLogs } from '@/hooks/useActivityLogs';

interface ActivityTimelineProps {
    companyId?: string | null;
    limit?: number;
}

const entityIcons = {
    strategy: FileText,
    company: Building2,
    task: CheckSquare,
};

export function ActivityTimeline({ companyId, limit = 20 }: ActivityTimelineProps) {
    const { data: logs = [], isLoading } = useActivityLogs(companyId, limit);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Activity className="w-6 h-6 animate-pulse text-muted-foreground" />
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nenhuma atividade ainda</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {logs.map((log, index) => {
                const Icon = entityIcons[log.entityType] || Activity;
                const isLast = index === logs.length - 1;

                return (
                    <div key={log.id} className="flex gap-4">
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-primary" />
                            </div>
                            {!isLast && <div className="flex-1 w-px bg-border mt-2" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4">
                            <p className="text-sm">
                                <span className="font-medium">{log.userName}</span>
                                {' '}
                                <span className="text-muted-foreground">{actionLabels[log.action]}</span>
                                {' '}
                                {log.newValue && (
                                    <span className="font-medium">"{log.newValue}"</span>
                                )}
                                {log.fieldChanged && (
                                    <span className="text-muted-foreground">
                                        {' '}(campo: {log.fieldChanged})
                                    </span>
                                )}
                            </p>
                            {log.oldValue && log.newValue && log.oldValue !== log.newValue && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    De "{log.oldValue}" para "{log.newValue}"
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(log.createdAt, { addSuffix: true, locale: ptBR })}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
