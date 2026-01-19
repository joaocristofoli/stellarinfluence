import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border/50 rounded-xl bg-card/30 backdrop-blur-sm",
            className
        )}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 ring-4 ring-background shadow-lg shadow-primary/5">
                <Icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </div>

            <h3 className="font-display font-semibold text-xl mb-2 tracking-tight">
                {title}
            </h3>

            <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
                {description}
            </p>

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    size="lg"
                    className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
