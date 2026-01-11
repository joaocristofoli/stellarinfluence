import { TrendingUp, Target, DollarSign, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MarketingStrategy, channelTypeLabels } from '@/types/marketing';

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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const stats = [
        {
            label: 'Total de Estratégias',
            value: strategies.length,
            icon: Target,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
        },
        {
            label: 'Orçamento Total',
            value: formatCurrency(totalBudget),
            icon: DollarSign,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            label: 'Em Andamento',
            value: inProgressCount,
            icon: TrendingUp,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
        },
        {
            label: 'Concluídas',
            value: completedCount,
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="card-hover">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                    <p className={`font-display font-bold text-lg ${stat.color}`}>
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {topChannel && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Maior investimento</p>
                                <p className="font-display font-semibold text-foreground">
                                    {channelTypeLabels[topChannel[0] as keyof typeof channelTypeLabels]}
                                </p>
                            </div>
                            <p className="font-display font-bold text-xl text-primary">
                                {formatCurrency(topChannel[1])}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
