import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MarketingStrategy, MarketingCampaign, channelTypeLabels, channelTypeIcons } from '@/types/marketing';
import { DollarSign, PieChart } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';


interface CampaignStatsProps {
    strategies: MarketingStrategy[];
    campaign?: MarketingCampaign | null;
}

export function CampaignStats({ strategies, campaign }: CampaignStatsProps) {
    const stats = useMemo(() => {
        const totalBudget = strategies.reduce((sum, s) => sum + s.budget, 0);

        // Group by channel type
        const channelBudgets: Record<string, number> = {};
        strategies.forEach(s => {
            channelBudgets[s.channelType] = (channelBudgets[s.channelType] || 0) + s.budget;
        });

        // Calculate percentages and sort by value
        const channelBreakdown = Object.entries(channelBudgets)
            .map(([channel, budget]) => ({
                channel,
                budget,
                percentage: totalBudget > 0 ? (budget / totalBudget) * 100 : 0,
                label: channelTypeLabels[channel as keyof typeof channelTypeLabels] || channel,
                icon: channelTypeIcons[channel as keyof typeof channelTypeIcons] || '📊',
            }))
            .sort((a, b) => b.budget - a.budget);

        return {
            totalBudget,
            channelBreakdown,
            strategyCount: strategies.length,
        };
    }, [strategies]);

    // formatCurrency importado de @/utils/formatters

    if (strategies.length === 0) {
        return null;
    }

    return (
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-background">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    {campaign ? `Resumo: ${campaign.name} ` : 'Resumo Geral'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Total Budget */}
                <div className="flex items-center justify-between p-3 bg-purple-100/50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Total da {campaign ? 'Campanha' : 'Empresa'}</span>
                    </div>
                    <span className="text-xl font-bold text-purple-700 dark:text-purple-400">
                        {formatCurrency(stats.totalBudget)}
                    </span>
                </div>

                {/* Channel Breakdown */}
                {stats.channelBreakdown.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">
                            Distribuição por Canal ({stats.strategyCount} estratégia{stats.strategyCount !== 1 ? 's' : ''})
                        </h4>
                        <div className="space-y-2">
                            {stats.channelBreakdown.map(({ channel, budget, percentage, label, icon }) => (
                                <div key={channel} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                            <span>{icon}</span>
                                            <span>{label}</span>
                                        </span>
                                        <span className="text-muted-foreground">
                                            {formatCurrency(budget)} ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <Progress
                                        value={percentage}
                                        className="h-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
