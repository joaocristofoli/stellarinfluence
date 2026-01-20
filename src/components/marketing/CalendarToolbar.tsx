
import { Button } from '@/components/ui/button';
import { useCalendarStore, useCalendarUndo } from '@/stores/useCalendarStore';
import { calculateBudgetBurn } from '@/utils/calendarHelpers';
import { formatCurrency } from '@/utils/formatters';
import { motion } from 'framer-motion';
import {
    Filter,
    Ghost,
    Undo2,
    Redo2,
    CalendarSearch,
    Download,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';

interface CalendarToolbarProps {
    totalBudget: number; // Orçamento total da campanha/período
    onExport: () => void;
    onViewChange: (view: 'month' | 'week' | 'day' | 'agenda') => void;
    currentView: string;
    date: Date;
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
}

export function CalendarToolbar({
    totalBudget,
    onExport,
    onViewChange,
    currentView,
    date,
    onNavigate
}: CalendarToolbarProps) {
    const { strategies, ghostMode, toggleGhostMode } = useCalendarStore();
    const { undo, redo, canUndo, canRedo } = useCalendarUndo();

    // Calcular Queima de Budget em Real Time 💸
    const burn = calculateBudgetBurn(strategies, totalBudget);

    return (
        <div className="space-y-4 mb-6 animate-fade-in">
            {/* Top Row: Budget Burn Bar & Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">

                {/* 1. Navigation & Title (NEW) */}
                <div className="flex items-center gap-4">
                    <div className="flex bg-black/20 rounded-lg p-1 border border-white/10">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onNavigate('PREV')}
                            className="h-8 w-8 hover:bg-white/10"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate('TODAY')}
                            className="h-8 px-3 text-xs font-bold uppercase hover:bg-white/10"
                        >
                            Hoje
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onNavigate('NEXT')}
                            className="h-8 w-8 hover:bg-white/10"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="text-2xl font-display font-bold text-white tracking-tight capitalize">
                        {date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </div>
                </div>

                {/* 2. Budget Burn (Compact) */}
                <div className="flex-1 w-full md:max-w-md hidden md:block">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">
                            Budget Burn
                        </span>
                        <div className={`text-[10px] font-bold ${burn.status === 'critical' ? 'text-red-500' : burn.status === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {burn.usagePercent.toFixed(0)}%
                        </div>
                    </div>

                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden relative shadow-inner border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(burn.usagePercent, 100)}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                            className={`h-full absolute left-0 top-0 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${burn.status === 'critical' ? 'bg-gradient-to-r from-red-600 to-red-400' :
                                    burn.status === 'warning' ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                                        'bg-gradient-to-r from-emerald-600 to-emerald-400'
                                }`}
                        />
                    </div>
                </div>

                {/* 3. Actions & Tools */}
                <div className="flex gap-2 items-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={undo}
                                    disabled={!canUndo}
                                    className="bg-black/20 border-white/10 hover:bg-white/10"
                                >
                                    <Undo2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Desfazer (Ctrl+Z)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={redo}
                                    disabled={!canRedo}
                                    className="bg-black/20 border-white/10 hover:bg-white/10"
                                >
                                    <Redo2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Refazer</TooltipContent>
                        </Tooltip>

                        <div className="w-[1px] h-8 bg-white/10 mx-1" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={ghostMode ? "default" : "outline"}
                                    size="icon"
                                    onClick={toggleGhostMode}
                                    className={`transition-all ${ghostMode ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-black/20 border-white/10 text-muted-foreground'}`}
                                >
                                    <Ghost className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Ghost Mode (Ver Rascunhos)
                            </TooltipContent>
                        </Tooltip>

                        <Button
                            variant="outline"
                            className="bg-black/20 border-white/10 hover:bg-white/10 gap-2"
                            onClick={onExport}
                        >
                            <Download className="w-4 h-4" />
                            PDF
                        </Button>
                    </TooltipProvider>
                </div>
            </div>

            {/* Bottom Row: View Switcher & Filters */}
            <div className="flex justify-between items-center">
                <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => onViewChange('month')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'month' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
                    >
                        Mês
                    </button>
                    <button
                        onClick={() => onViewChange('week')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'week' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => onViewChange('day')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'day' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
                    >
                        Dia
                    </button>
                </div>

                <div className="flex gap-2">
                    {/* Aqui entrariam filtros de faceta (Instagram, TikTok) futuramento */}
                    <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </Button>
                </div>
            </div>
        </div>
    );
}
