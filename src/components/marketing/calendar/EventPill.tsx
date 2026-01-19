import { cn } from '@/lib/utils';
import { ChannelType } from '@/types/marketing';
import { Check } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface EventPillProps {
    title: string;
    channelType: ChannelType;
    status: 'planned' | 'in_progress' | 'completed';
    budget?: number;
    onClick: () => void;
    className?: string;
}

// Sistema de cores semântico por tipo de canal
const channelStyles: Record<ChannelType, { bg: string; text: string; border: string; dot: string }> = {
    influencer: {
        bg: 'bg-pink-50 hover:bg-pink-100',
        text: 'text-pink-700',
        border: 'border-l-pink-500',
        dot: 'bg-pink-500'
    },
    paid_traffic: {
        bg: 'bg-blue-50 hover:bg-blue-100',
        text: 'text-blue-700',
        border: 'border-l-blue-500',
        dot: 'bg-blue-500'
    },
    flyers: {
        bg: 'bg-green-50 hover:bg-green-100',
        text: 'text-green-700',
        border: 'border-l-green-500',
        dot: 'bg-green-500'
    },
    physical_media: {
        bg: 'bg-orange-50 hover:bg-orange-100',
        text: 'text-orange-700',
        border: 'border-l-orange-500',
        dot: 'bg-orange-500'
    },
    events: {
        bg: 'bg-violet-50 hover:bg-violet-100',
        text: 'text-violet-700',
        border: 'border-l-violet-500',
        dot: 'bg-violet-500'
    },
    partnerships: {
        bg: 'bg-yellow-50 hover:bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-l-yellow-500',
        dot: 'bg-yellow-500'
    },
    social_media: {
        bg: 'bg-cyan-50 hover:bg-cyan-100',
        text: 'text-cyan-700',
        border: 'border-l-cyan-500',
        dot: 'bg-cyan-500'
    },
    email_marketing: {
        bg: 'bg-indigo-50 hover:bg-indigo-100',
        text: 'text-indigo-700',
        border: 'border-l-indigo-500',
        dot: 'bg-indigo-500'
    },
    radio: {
        bg: 'bg-red-50 hover:bg-red-100',
        text: 'text-red-700',
        border: 'border-l-red-500',
        dot: 'bg-red-500'
    },
    sound_car: {
        bg: 'bg-amber-50 hover:bg-amber-100',
        text: 'text-amber-700',
        border: 'border-l-amber-500',
        dot: 'bg-amber-500'
    },
    promoters: {
        bg: 'bg-teal-50 hover:bg-teal-100',
        text: 'text-teal-700',
        border: 'border-l-teal-500',
        dot: 'bg-teal-500'
    },
};

export function EventPill({ title, channelType, status, budget, onClick, className }: EventPillProps) {
    const styles = channelStyles[channelType] || channelStyles.events;
    const isCompleted = status === 'completed';

    return (
        <button
            onClick={onClick}
            className={cn(
                // Base styles
                "group w-full text-left px-2 py-1.5 rounded-md text-xs font-medium",
                "transition-all duration-150 ease-out cursor-pointer",
                "border-l-[3px]",
                // Channel colors
                styles.bg,
                styles.text,
                styles.border,
                // Completed state
                isCompleted && "opacity-60",
                // Hover effects
                "hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5",
                // Active state
                "active:scale-[0.98] active:shadow-sm",
                className
            )}
        >
            <div className="flex items-center gap-1.5">
                {/* Color dot */}
                <span className={cn(
                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                    styles.dot
                )} />

                {/* Title */}
                <span className={cn(
                    "truncate flex-1 leading-tight",
                    isCompleted && "line-through"
                )}>
                    {title}
                </span>

                {/* Completed check */}
                {isCompleted && (
                    <Check className="w-3 h-3 flex-shrink-0 text-green-600" />
                )}
            </div>

            {/* Budget (optional) */}
            {budget !== undefined && budget > 0 && (
                <div className="text-[10px] opacity-70 mt-0.5 pl-3">
                    {formatCurrency(budget)}
                </div>
            )}
        </button>
    );
}
