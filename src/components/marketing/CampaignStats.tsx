import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MarketingStrategy, MarketingCampaign, ChannelType, channelTypeLabels, channelTypeIcons } from '@/types/marketing';
import { DollarSign, PieChart, TrendingUp, Hash } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

// Cores por tipo de canal
const channelColors: Record<ChannelType, { bg: string; border: string; text: string; progressBg: string }> = {
    influencer: { bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-600 dark:text-pink-400', progressBg: 'bg-pink-500' },
    paid_traffic: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600 dark:text-blue-400', progressBg: 'bg-blue-500' },
    flyers: { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-600 dark:text-green-400', progressBg: 'bg-green-500' },
    physical_media: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-600 dark:text-orange-400', progressBg: 'bg-orange-500' },
    events: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-600 dark:text-purple-400', progressBg: 'bg-purple-500' },
    partnerships: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-600 dark:text-yellow-400', progressBg: 'bg-yellow-500' },
    social_media: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200 dark:border-cyan-800', text: 'text-cyan-600 dark:text-cyan-400', progressBg: 'bg-cyan-500' },
    email_marketing: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-600 dark:text-indigo-400', progressBg: 'bg-indigo-500' },
    radio: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-600 dark:text-red-400', progressBg: 'bg-red-500' },
    sound_car: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400', progressBg: 'bg-amber-500' },
    promoters: { bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-800', text: 'text-teal-600 dark:text-teal-400', progressBg: 'bg-teal-500' },
};

interface CampaignStatsProps {
    strategies: MarketingStrategy[];
    campaign?: MarketingCampaign | null;
}

export function CampaignStats({ strategies, campaign }: CampaignStatsProps) {
    const stats = useMemo(() => {
        const totalBudget = strategies.reduce((sum, s) => sum + s.budget, 0);

        // Group by channel type with count
        const channelData: Record<string, { budget: number; count: number }> = {};
        strategies.forEach(s => {
            if (!channelData[s.channelType]) {
                channelData[s.channelType] = { budget: 0, count: 0 };
            }
            channelData[s.channelType].budget += s.budget;
            channelData[s.channelType].count += 1;
        });

        // Calculate percentages and sort by value
        const channelBreakdown = Object.entries(channelData)
            .map(([channel, data]) => ({
                channel: channel as ChannelType,
                budget: data.budget,
                count: data.count,
                percentage: totalBudget > 0 ? (data.budget / totalBudget) * 100 : 0,
                label: channelTypeLabels[channel as keyof typeof channelTypeLabels] || channel,
                icon: channelTypeIcons[channel as keyof typeof channelTypeIcons] || '📊',
                colors: channelColors[channel as ChannelType] || channelColors.events,
            }))
            .sort((a, b) => b.budget - a.budget);

        return {
            totalBudget,
            channelBreakdown,
            strategyCount: strategies.length,
        };
    }, [strategies]);

    if (strategies.length === 0) {
        return null;
    }

    return (
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-background">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    {campaign ? `Resumo: ${campaign.name}` : 'Resumo Geral'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                {/* Total Budget */}
                <div className="flex items-center justify-between p-4 bg-purple-100/50 dark:bg-purple-900/20 rounded-xl">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Total da {campaign ? 'Campanha' : 'Empresa'}</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                        {formatCurrency(stats.totalBudget)}
                    </span>
                </div>

                {/* Channel Breakdown - Cards Grid */}
                {stats.channelBreakdown.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Distribuição por Canal ({stats.strategyCount} estratégia{stats.strategyCount !== 1 ? 's' : ''})
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {stats.channelBreakdown.map(({ channel, budget, count, percentage, label, icon, colors }) => (
                                <div
                                    key={channel}
                                    className={`p-4 rounded-xl border-2 ${colors.bg} ${colors.border} transition-all hover:scale-[1.02] hover:shadow-md`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="flex items-center gap-2 font-semibold">
                                            <span className="text-xl">{icon}</span>
                                            <span className={colors.text}>{label}</span>
                                        </span>
                                        <span className={`text-lg font-bold ${colors.text}`}>
                                            {formatCurrency(budget)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                        <span className="flex items-center gap-1">
                                            <Hash className="w-3 h-3" />
                                            {count} {count === 1 ? 'ação' : 'ações'}
                                        </span>
                                        <span className="font-semibold">{percentage.toFixed(1)}%</span>
                                    </div>

                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colors.progressBg} transition-all duration-500`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

