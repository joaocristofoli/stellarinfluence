
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingStrategy, MarketingCampaign, ChannelType, channelTypeLabels, channelTypeIcons } from '@/types/marketing';
import { formatCurrency } from '@/utils/formatters';
import { MoneyService } from '@/services/MoneyService';
import { TrendingUp, Target, CheckCircle2, Wallet, PieChart, Activity } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// Cores por tipo de canal (Compact Version)
const channelColors: Record<ChannelType, { text: string; bg: string }> = {
    influencer: { text: 'text-pink-600', bg: 'bg-pink-500' },
    paid_traffic: { text: 'text-blue-600', bg: 'bg-blue-500' },
    flyers: { text: 'text-green-600', bg: 'bg-green-500' },
    physical_media: { text: 'text-orange-600', bg: 'bg-orange-500' },
    events: { text: 'text-purple-600', bg: 'bg-purple-500' },
    partnerships: { text: 'text-yellow-600', bg: 'bg-yellow-500' },
    social_media: { text: 'text-cyan-600', bg: 'bg-cyan-500' },
    email_marketing: { text: 'text-indigo-600', bg: 'bg-indigo-500' },
    radio: { text: 'text-red-600', bg: 'bg-red-500' },
    sound_car: { text: 'text-amber-600', bg: 'bg-amber-500' },
    promoters: { text: 'text-teal-600', bg: 'bg-teal-500' },
};

interface UnifiedDashboardProps {
    strategies: MarketingStrategy[];
    campaign?: MarketingCampaign | null;
}

export function UnifiedDashboard({ strategies, campaign }: UnifiedDashboardProps) {
    const stats = useMemo(() => {
        // 1. Calculate Financials
        const totalBudget = strategies.reduce((sum, s) => {
            const currency = (s as any).currency || 'BRL';
            return sum + MoneyService.normalizeToBRL(s.budget, currency);
        }, 0);

        const inProgress = strategies.filter(s => s.status === 'in_progress').length;
        const completed = strategies.filter(s => s.status === 'completed').length;
        const planned = strategies.filter(s => s.status === 'planned').length;

        // 2. Calculate Channel Distribution
        const channelData: Record<string, number> = {};
        strategies.forEach(s => {
            channelData[s.channelType] = (channelData[s.channelType] || 0) + s.budget;
        });

        const sortedChannels = Object.entries(channelData)
            .map(([channel, budget]) => ({
                channel: channel as ChannelType,
                budget,
                percentage: totalBudget > 0 ? (budget / totalBudget) * 100 : 0,
                label: channelTypeLabels[channel as keyof typeof channelTypeLabels],
                icon: channelTypeIcons[channel as keyof typeof channelTypeIcons],
                colors: channelColors[channel as ChannelType] || channelColors.events,
            }))
            .sort((a, b) => b.budget - a.budget);

        // Top 3 channels + Others
        const topChannels = sortedChannels.slice(0, 3);
        const otherChannelsBudget = sortedChannels.slice(3).reduce((sum, c) => sum + c.budget, 0);

        if (otherChannelsBudget > 0) {
            topChannels.push({
                channel: 'connections' as ChannelType, // fallback generic
                budget: otherChannelsBudget,
                percentage: (otherChannelsBudget / totalBudget) * 100,
                label: 'Outros Canais',
                icon: '📦',
                colors: { text: 'text-gray-500', bg: 'bg-gray-400' }
            });
        }

        return {
            totalBudget,
            inProgress,
            completed,
            planned,
            topChannels,
            totalChannels: Object.keys(channelData).length
        };
    }, [strategies]);

    if (strategies.length === 0) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* LEFT: Core Metrics (Budget + Counts) - Spans 7 cols */}
            <Card className="lg:col-span-7 border-white/10 bg-background/50 backdrop-blur-lg shadow-sm">
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Total Budget (Hero) */}
                        <div className="col-span-2 flex flex-col justify-center border-r border-border/50 pr-6">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-1">
                                <Wallet className="w-4 h-4 text-emerald-500" />
                                {campaign ? 'Orçamento (Campanha)' : 'Investimento Total'}
                            </span>
                            <div className="text-3xl lg:text-4xl font-display font-bold text-foreground tracking-tight">
                                {formatCurrency(stats.totalBudget)}
                            </div>
                            <span className="text-xs text-emerald-600/80 mt-1 font-medium bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
                                +{strategies.length} ações estratégicas
                            </span>
                        </div>

                        {/* Status Counts */}
                        <div className="flex flex-col gap-4 col-span-2 lg:col-span-2">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Active */}
                                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Activity className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="text-xs font-medium text-muted-foreground">Em Andamento</span>
                                    </div>
                                    <span className="text-xl font-bold text-blue-600">{stats.inProgress}</span>
                                </div>

                                {/* Completed */}
                                <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                                        <span className="text-xs font-medium text-muted-foreground">Concluídas</span>
                                    </div>
                                    <span className="text-xl font-bold text-purple-600">{stats.completed}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* RIGHT: Channel Distribution (Compact Horizontal Meters) - Spans 5 cols */}
            <Card className="lg:col-span-5 border-white/10 bg-background/50 backdrop-blur-lg shadow-sm flex flex-col justify-center">
                <CardHeader className="pb-2 pt-4 px-6">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <PieChart className="w-4 h-4" /> Distribuição de Investimento
                        </span>
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                            {stats.totalChannels} canais ativos
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-3">
                    {stats.topChannels.map((c, i) => (
                        <TooltipProvider key={i}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="space-y-1 cursor-default">
                                        <div className="flex justify-between text-xs">
                                            <span className={`font-medium flex items-center gap-1.5 ${c.colors.text}`}>
                                                <span>{c.icon}</span> {c.label}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <span className="text-foreground font-semibold">
                                                    {formatCurrency(c.budget)}
                                                </span>
                                                <span className="text-muted-foreground font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded">
                                                    {c.percentage.toFixed(0)}%
                                                </span>
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${c.colors.bg} transition-all duration-500`}
                                                style={{ width: `${c.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p className="font-semibold">{c.label}</p>
                                    <p className="text-sm">{formatCurrency(c.budget)} ({c.percentage.toFixed(1)}%)</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
