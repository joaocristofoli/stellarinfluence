import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PremiumEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function PremiumEmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className
}: PremiumEmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-500", className)}>
            <div className="relative group">
                <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-white/5 border border-white/10 p-8 rounded-2xl shadow-premium backdrop-blur-sm mb-6 max-w-[120px] mx-auto flex items-center justify-center">
                    <Icon className="w-12 h-12 text-foreground/80" strokeWidth={1.5} />
                </div>
            </div>

            <h3 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/50 mb-3 tracking-tight">
                {title}
            </h3>

            <p className="max-w-md mb-10 text-lg text-muted-foreground font-light leading-relaxed text-balance">
                {description}
            </p>

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    size="lg"
                    className="gap-2 shadow-glow hover:shadow-premium hover:scale-105 transition-all duration-300 rounded-xl px-10 h-14 text-base font-semibold bg-primary text-primary-foreground border-0"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
