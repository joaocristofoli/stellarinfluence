import { useMemo } from 'react';
import { TrendingUp, Wallet, Target, BarChart3, DollarSign, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingStrategy, channelTypeLabels, channelTypeIcons, channelTypeColors } from '@/types/marketing';
import { formatCurrency } from '@/utils/formatters';

interface StatsOverviewProps {
    strategies: MarketingStrategy[];
}

export function StatsOverview({ strategies }: StatsOverviewProps) {
    const totalBudget = strategies.reduce((sum, s) => sum + s.budget, 0);
    const completedCount = strategies.filter(s => s.status === 'completed').length;
    const inProgressCount = strategies.filter(s => s.status === 'in_progress').length;

    const channelBudgets = strategies.reduce((acc, s) => {
        acc[s.channelType] = (acc[s.channelType] || 0) + s.budget;
        return acc;
    }, {} as Record<string, number>);

    const topChannel = Object.entries(channelBudgets)
        .sort(([, a], [, b]) => b - a)[0];

    // formatCurrency importado de @/utils/formatters

    // Stats using CSS variables from company theme
    const stats = [
        {
            label: 'Total de Estratégias',
            value: strategies.length,
            icon: Target,
            useTheme: true,
            opacity: 1,
        },
        {
            label: 'Orçamento Total',
            value: formatCurrency(totalBudget),
            icon: DollarSign,
            useTheme: true,
            opacity: 0.85,
        },
        {
            label: 'Em Andamento',
            value: inProgressCount,
            icon: TrendingUp,
            useTheme: true,
            opacity: 0.7,
        },
        {
            label: 'Concluídas',
            value: completedCount,
            icon: CheckCircle2,
            useTheme: true,
            opacity: 0.55,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        className="card-hover overflow-hidden relative"
                        style={{
                            borderColor: 'var(--company-primary-medium)',
                        }}
                    >
                        {/* Subtle gradient accent */}
                        <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{
                                background: 'var(--company-gradient)',
                                opacity: stat.opacity
                            }}
                        />
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{
                                        background: 'var(--company-primary-light)',
                                    }}
                                >
                                    <stat.icon
                                        className="w-5 h-5"
                                        style={{ color: 'var(--company-primary)' }}
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                    <p
                                        className="font-display font-bold text-lg"
                                        style={{ color: 'var(--company-primary)' }}
                                    >
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {topChannel && (
                <Card
                    className="overflow-hidden"
                    style={{
                        borderColor: 'var(--company-primary-medium)',
                        background: 'var(--company-primary-light)',
                    }}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Maior investimento</p>
                                <p className="font-display font-semibold text-foreground">
                                    {channelTypeLabels[topChannel[0] as keyof typeof channelTypeLabels]}
                                </p>
                            </div>
                            <p
                                className="font-display font-bold text-xl"
                                style={{ color: 'var(--company-primary)' }}
                            >
                                {formatCurrency(topChannel[1])}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
