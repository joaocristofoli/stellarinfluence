import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, Clock, AlertCircle, Calendar, DollarSign, Target, Building2,
    LayoutGrid, CalendarDays, Eye, EyeOff
} from 'lucide-react';
import { getSharedPlan, SharedPlanData } from '@/utils/shareableLink';
import { CalendarReadOnly } from '@/components/marketing/CalendarReadOnly';
import { StrategyDetailDrawer } from '@/components/marketing/StrategyDetailDrawer';
import { formatCurrency } from '@/utils/formatters';
import { MarketingStrategy, ChannelType, channelTypeLabels, channelTypeIcons } from '@/types/marketing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Premium channel colors - Gold for Influencer, Emerald for Physical, etc.
const getChannelColor = (channelType: ChannelType): { bg: string; text: string; border: string } => {
    const colors: Record<ChannelType, { bg: string; text: string; border: string }> = {
        influencer: { bg: 'from-amber-500/20 to-orange-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
        paid_traffic: { bg: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
        flyers: { bg: 'from-green-500/20 to-emerald-500/20', text: 'text-green-300', border: 'border-green-500/30' },
        physical_media: { bg: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
        events: { bg: 'from-violet-500/20 to-purple-500/20', text: 'text-violet-300', border: 'border-violet-500/30' },
        partnerships: { bg: 'from-yellow-500/20 to-amber-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
        social_media: { bg: 'from-cyan-500/20 to-blue-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30' },
        email_marketing: { bg: 'from-indigo-500/20 to-violet-500/20', text: 'text-indigo-300', border: 'border-indigo-500/30' },
        radio: { bg: 'from-red-500/20 to-rose-500/20', text: 'text-red-300', border: 'border-red-500/30' },
        sound_car: { bg: 'from-orange-500/20 to-amber-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
        promoters: { bg: 'from-teal-500/20 to-cyan-500/20', text: 'text-teal-300', border: 'border-teal-500/30' },
    };
    return colors[channelType] || { bg: 'from-gray-500/20 to-slate-500/20', text: 'text-gray-300', border: 'border-gray-500/30' };
};

// Generate initials placeholder when logo is unavailable
const generateInitialsPlaceholder = (name: string): string => {
    return name
        .split(' ')
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join('');
};

type ViewMode = 'calendar' | 'feed';

export default function ClientPortalPage() {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<SharedPlanData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const [selectedStrategy, setSelectedStrategy] = useState<MarketingStrategy | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        async function loadPlan() {
            if (!id) {
                setError('Link inválido');
                setLoading(false);
                return;
            }

            try {
                const data = await getSharedPlan(id);
                if (!data) {
                    setError('expired');
                } else {
                    setPlan(data);
                }
            } catch (err) {
                console.error('Error loading plan:', err);
                setError('Erro ao carregar o planejamento');
            } finally {
                setLoading(false);
            }
        }

        loadPlan();
    }, [id]);

    const handleStrategyClick = (strategy: MarketingStrategy) => {
        setSelectedStrategy(strategy);
        setDrawerOpen(true);
    };

    // Loading state with premium animation
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                        <Loader2 className="w-16 h-16 animate-spin text-purple-400 mx-auto mb-4 relative z-10" />
                    </div>
                    <p className="text-white/70 text-lg font-medium">Carregando seu planejamento...</p>
                </motion.div>
            </div>
        );
    }

    // Expired state with glassmorphism
    if (error === 'expired') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 max-w-md text-center border border-white/20"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-xl">
                        <Clock className="w-10 h-10 text-orange-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">
                        Link Expirado
                    </h1>
                    <p className="text-white/70 mb-6 text-lg">
                        Este link de compartilhamento expirou.
                        Solicite um novo link ao responsável pelo planejamento.
                    </p>
                    <div className="text-sm text-white/50 bg-white/5 rounded-xl p-4 backdrop-blur-xl border border-white/10">
                        🔒 Links compartilhados têm validade por segurança.
                    </div>
                </motion.div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-slate-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 max-w-md text-center border border-white/20"
                >
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">Erro</h1>
                    <p className="text-white/70">{error}</p>
                </motion.div>
            </div>
        );
    }

    if (!plan) return null;

    const { companyData, strategiesData, hideFinancials } = plan;

    // Calculate stats (respecting hideFinancials)
    const totalBudget = hideFinancials ? 0 : strategiesData.reduce((sum, s) => sum + (s.budget || 0), 0);
    const totalStrategies = strategiesData.length;
    const uniqueChannels = [...new Set(strategiesData.map(s => s.channelType))].length;

    // Group by channel for Feed view
    const byChannel = strategiesData.reduce((acc, s) => {
        if (!acc[s.channelType]) acc[s.channelType] = [];
        acc[s.channelType].push(s);
        return acc;
    }, {} as Record<ChannelType, typeof strategiesData>);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
            {/* Header with Dynamic Branding */}
            <header className="bg-white/5 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                            {/* Logo slot with initials fallback */}
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 border border-white/20">
                                <span className="text-white font-serif font-bold text-lg sm:text-xl">
                                    {generateInitialsPlaceholder(companyData.name)}
                                </span>
                            </div>
                            <div>
                                <p className="text-purple-300 text-xs sm:text-sm font-medium">Planejamento Estratégico</p>
                                <h1 className="text-lg sm:text-2xl font-bold text-white">
                                    {companyData.name}
                                </h1>
                            </div>
                        </div>

                        {/* View Selector */}
                        <div className="flex items-center bg-white/5 backdrop-blur-xl rounded-xl p-1 border border-white/10">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('calendar')}
                                className={`rounded-lg transition-all ${viewMode === 'calendar'
                                    ? 'bg-purple-500 text-white shadow-lg'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <CalendarDays className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Calendário</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('feed')}
                                className={`rounded-lg transition-all ${viewMode === 'feed'
                                    ? 'bg-purple-500 text-white shadow-lg'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <LayoutGrid className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Feed</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
                {/* Stats Cards - Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6"
                >
                    <Card className="bg-white/5 backdrop-blur-2xl border-white/10 overflow-hidden group hover:bg-white/10 transition-all hover:border-blue-500/30">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                    <Target className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/60 text-xs sm:text-sm">Ações Planejadas</p>
                                    <p className="text-2xl sm:text-4xl font-black text-white">{totalStrategies}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {!hideFinancials && (
                        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 overflow-hidden group hover:bg-white/10 transition-all hover:border-emerald-500/30">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                        <DollarSign className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-xs sm:text-sm">Investimento Total</p>
                                        <p className="text-xl sm:text-3xl font-black text-white">{formatCurrency(totalBudget)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className={`bg-white/5 backdrop-blur-2xl border-white/10 overflow-hidden group hover:bg-white/10 transition-all hover:border-purple-500/30 ${hideFinancials ? 'col-span-1' : ''}`}>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/60 text-xs sm:text-sm">Canais Ativos</p>
                                    <p className="text-2xl sm:text-4xl font-black text-white">{uniqueChannels}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* View Content */}
                <AnimatePresence mode="wait">
                    {viewMode === 'calendar' ? (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-4 sm:p-6 overflow-hidden"
                        >
                            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-400" />
                                Calendário de Ações
                            </h2>
                            <div className="client-portal-calendar">
                                <CalendarReadOnly
                                    strategies={strategiesData}
                                    showBudget={!hideFinancials}
                                    onEventClick={handleStrategyClick}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="feed"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-4 sm:p-6"
                        >
                            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                                <LayoutGrid className="w-5 h-5 text-purple-400" />
                                Ações por Canal
                            </h2>

                            <div className="space-y-6 sm:space-y-8">
                                {Object.entries(byChannel).map(([channel, strategies], index) => {
                                    const colors = getChannelColor(channel as ChannelType);
                                    return (
                                        <motion.div
                                            key={channel}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="space-y-3 sm:space-y-4"
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <span className="text-xl sm:text-2xl">{channelTypeIcons[channel as ChannelType]}</span>
                                                <h3 className="text-base sm:text-lg font-semibold text-white">
                                                    {channelTypeLabels[channel as ChannelType]}
                                                </h3>
                                                <Badge
                                                    className={`ml-auto bg-gradient-to-r ${colors.bg} ${colors.text} ${colors.border} border`}
                                                >
                                                    {strategies.length} {strategies.length === 1 ? 'ação' : 'ações'}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                                {strategies.map((strategy, strategyIndex) => (
                                                    <motion.div
                                                        key={strategy.id}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.1 + strategyIndex * 0.05 }}
                                                        className={`bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border-l-4 ${colors.border} hover:bg-white/10 transition-all cursor-pointer group`}
                                                        onClick={() => handleStrategyClick(strategy)}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                                                                {strategy.name}
                                                            </h4>
                                                            {!hideFinancials && strategy.budget > 0 && (
                                                                <span className="text-sm sm:text-lg font-bold text-emerald-400 whitespace-nowrap">
                                                                    {formatCurrency(strategy.budget)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {strategy.description && (
                                                            <p className="text-white/60 text-xs sm:text-sm mt-2 line-clamp-2">
                                                                {strategy.description}
                                                            </p>
                                                        )}
                                                        {strategy.startDate && (
                                                            <p className="text-white/40 text-xs mt-2 sm:mt-3 flex items-center gap-1">
                                                                📅 {new Date(strategy.startDate).toLocaleDateString('pt-BR')}
                                                                {strategy.endDate && ` → ${new Date(strategy.endDate).toLocaleDateString('pt-BR')}`}
                                                            </p>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer / Contact - Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-8 text-center"
                >
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        Dúvidas sobre o planejamento?
                    </h2>
                    <p className="text-white/60 mb-4 text-sm sm:text-base">
                        Entre em contato com o responsável pelo seu projeto para ajustarmos juntos!
                    </p>
                    {companyData.representativeName && (
                        <p className="text-white/80 text-base sm:text-lg">
                            👤 Responsável: <strong>{companyData.representativeName}</strong>
                            {companyData.representativeRole && (
                                <span className="text-white/60"> ({companyData.representativeRole})</span>
                            )}
                        </p>
                    )}
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 mt-8 sm:mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <img src="/logo-eternizar.png" alt="Agência Eternizar" className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500" />
                        <p className="text-white/40 text-xs sm:text-sm">
                            🔒 Link protegido por UUID único • {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </footer>

            {/* Strategy Detail Drawer */}
            <StrategyDetailDrawer
                strategy={selectedStrategy}
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                hideFinancials={hideFinancials}
            />
        </div>
    );
}
