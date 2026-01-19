import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, User, Target, Clock, ExternalLink } from 'lucide-react';
import { MarketingStrategy, ChannelType, channelTypeLabels, channelTypeIcons } from '@/types/marketing';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';

interface StrategyDetailDrawerProps {
    strategy: MarketingStrategy | null;
    isOpen: boolean;
    onClose: () => void;
    hideFinancials?: boolean;
}

// Premium channel colors
const channelColors: Record<ChannelType, { bg: string; border: string; text: string }> = {
    influencer: { bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', text: 'text-amber-300' },
    paid_traffic: { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', text: 'text-blue-300' },
    flyers: { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', text: 'text-green-300' },
    physical_media: { bg: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', text: 'text-emerald-300' },
    events: { bg: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', text: 'text-violet-300' },
    partnerships: { bg: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30', text: 'text-yellow-300' },
    social_media: { bg: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', text: 'text-cyan-300' },
    email_marketing: { bg: 'from-indigo-500/20 to-violet-500/20', border: 'border-indigo-500/30', text: 'text-indigo-300' },
    radio: { bg: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30', text: 'text-red-300' },
    sound_car: { bg: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30', text: 'text-orange-300' },
    promoters: { bg: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-500/30', text: 'text-teal-300' },
};

/**
 * StrategyDetailDrawer - Premium side drawer for strategy details
 * Features smooth framer-motion animations and glassmorphism design
 */
export function StrategyDetailDrawer({
    strategy,
    isOpen,
    onClose,
    hideFinancials = false,
}: StrategyDetailDrawerProps) {
    if (!strategy) return null;

    const colors = channelColors[strategy.channelType] || channelColors.influencer;

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
                    >
                        {/* Header with gradient accent */}
                        <div className={`bg-gradient-to-r ${colors.bg} border-b ${colors.border} p-6 sticky top-0 backdrop-blur-xl z-10`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-3xl border ${colors.border}`}>
                                        {channelTypeIcons[strategy.channelType]}
                                    </div>
                                    <div>
                                        <span className={`text-xs font-medium ${colors.text} uppercase tracking-wider`}>
                                            {channelTypeLabels[strategy.channelType]}
                                        </span>
                                        <h2 className="text-xl font-bold text-white mt-1 line-clamp-2">
                                            {strategy.name}
                                        </h2>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="text-white/60 hover:text-white hover:bg-white/10"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                {!hideFinancials && strategy.budget > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
                                    >
                                        <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                                            <DollarSign className="w-4 h-4" />
                                            Investimento
                                        </div>
                                        <p className="text-2xl font-bold text-emerald-400">
                                            {formatCurrency(strategy.budget)}
                                        </p>
                                    </motion.div>
                                )}

                                {strategy.responsible && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
                                    >
                                        <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                                            <User className="w-4 h-4" />
                                            Responsável
                                        </div>
                                        <p className="text-lg font-semibold text-white truncate">
                                            {strategy.responsible}
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Dates */}
                            {(strategy.startDate || strategy.endDate) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
                                >
                                    <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                                        <Calendar className="w-4 h-4" />
                                        Período
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {strategy.startDate && (
                                            <div className="bg-purple-500/20 px-3 py-2 rounded-lg border border-purple-500/30">
                                                <p className="text-xs text-purple-300">Início</p>
                                                <p className="text-white font-medium">
                                                    {formatDate(strategy.startDate)}
                                                </p>
                                            </div>
                                        )}
                                        {strategy.endDate && (
                                            <>
                                                <span className="text-white/40">→</span>
                                                <div className="bg-pink-500/20 px-3 py-2 rounded-lg border border-pink-500/30">
                                                    <p className="text-xs text-pink-300">Fim</p>
                                                    <p className="text-white font-medium">
                                                        {formatDate(strategy.endDate)}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Description */}
                            {strategy.description && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
                                >
                                    <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                                        <Target className="w-4 h-4" />
                                        Descrição
                                    </div>
                                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                                        {strategy.description}
                                    </p>
                                </motion.div>
                            )}

                            {/* How to do */}
                            {strategy.howToDo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
                                >
                                    <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                                        🛠️ Como Fazer
                                    </div>
                                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                                        {strategy.howToDo}
                                    </p>
                                </motion.div>
                            )}

                            {/* Why to do */}
                            {strategy.whyToDo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
                                >
                                    <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                                        💡 Por Que Fazer
                                    </div>
                                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                                        {strategy.whyToDo}
                                    </p>
                                </motion.div>
                            )}

                            {/* Status Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex justify-center pt-4"
                            >
                                <div className={`
                                    px-4 py-2 rounded-full text-sm font-medium
                                    ${strategy.status === 'completed'
                                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                        : strategy.status === 'in_progress'
                                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                    }
                                `}>
                                    {strategy.status === 'completed' ? '✅ Concluído' :
                                        strategy.status === 'in_progress' ? '🚀 Em Andamento' : '📋 Planejado'}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
