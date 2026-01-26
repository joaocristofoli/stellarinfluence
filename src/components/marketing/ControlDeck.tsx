
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, Calendar as CalendarIcon, Filter, X, Columns, ChevronLeft, ChevronRight } from 'lucide-react';
import { CampaignSelector } from './CampaignSelector';
import { MarketingCampaign, ChannelType, channelTypeIcons, channelTypeLabels, channelTypeColors } from '@/types/marketing';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ControlDeckProps {
    // Campaign Props
    campaigns: MarketingCampaign[];
    selectedCampaign: MarketingCampaign | 'all' | 'none';
    onSelectCampaign: (c: MarketingCampaign | 'all' | 'none') => void;
    onNewCampaign: () => void;
    onEditCampaign: () => void;
    loadingCampaigns: boolean;

    // View Props
    viewMode: 'cards' | 'calendar' | 'kanban' | 'financial';
    onViewModeChange: (mode: 'cards' | 'calendar' | 'kanban' | 'financial') => void;

    // Sort Props
    sortOrder: 'date_asc' | 'date_desc' | 'budget_desc';
    onSortChange: (sort: 'date_asc' | 'date_desc' | 'budget_desc') => void;

    // Filter Props
    selectedChannels: ChannelType[];
    onToggleChannel: (c: ChannelType) => void;
    onClearFilters: () => void;

    // Action Props
    onNewStrategy: () => void;

    // Calendar Props (Phase 37)
    currentDate?: Date;
    onNavigateDate?: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
    calendarView?: 'month' | 'week' | 'day' | 'agenda';
    onCalendarViewChange?: (view: 'month' | 'week' | 'day' | 'agenda') => void;
}

const channelTypes: ChannelType[] = [
    'influencer', 'paid_traffic', 'flyers', 'physical_media', 'events',
    'partnerships', 'social_media', 'email_marketing', 'radio', 'sound_car', 'promoters'
];

export function ControlDeck({
    campaigns,
    selectedCampaign,
    onSelectCampaign,
    onNewCampaign,
    onEditCampaign,
    loadingCampaigns,
    viewMode,
    onViewModeChange,
    selectedChannels,
    onToggleChannel,
    onClearFilters,
    onNewStrategy,
    sortOrder = 'date_asc', // Default: Execution Order
    onSortChange,
    // Calendar Props
    currentDate,
    onNavigateDate,
    calendarView,
    onCalendarViewChange
}: ControlDeckProps) {
    return (
        <div className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-sm mb-6 flex flex-col lg:flex-row flex-wrap gap-4 justify-between items-center transition-all duration-300">

            {/* LEFT: Context & Filters */}
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">

                {/* Campaign Selector */}
                <div className="shrink-0">
                    <CampaignSelector
                        campaigns={campaigns}
                        selectedCampaign={selectedCampaign}
                        onSelectCampaign={onSelectCampaign}
                        onNewCampaign={onNewCampaign}
                        onEditCampaign={onEditCampaign}
                        disabled={loadingCampaigns}
                    />
                </div>

                <div className="h-8 w-[1px] bg-border/50 hidden lg:block" />

                {/* CALENDAR NAVIGATION (Only in Calendar Mode) */}
                {viewMode === 'calendar' && currentDate && onNavigateDate && (
                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-white/5 animate-in fade-in slide-in-from-left-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onNavigateDate('PREV')}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-semibold min-w-[100px] text-center capitalize">
                            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onNavigateDate('NEXT')}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <div className="h-4 w-[1px] bg-border/50 mx-1" />
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold" onClick={() => onNavigateDate('TODAY')}>
                            Hoje
                        </Button>
                    </div>
                )}

                {viewMode === 'calendar' && <div className="h-8 w-[1px] bg-border/50 hidden lg:block" />}

                {/* Quick Filters Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={selectedChannels.length > 0 ? "secondary" : "outline"} className="gap-2 shrink-0 border-dashed">
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline">Canais</span>
                            {selectedChannels.length > 0 && (
                                <span className="bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                                    {selectedChannels.length}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-4" align="start">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">Filtrar por Canal</h4>
                            {selectedChannels.length > 0 && (
                                <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-auto p-0 text-muted-foreground hover:text-destructive">
                                    Limpar
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {channelTypes.map(channel => (
                                <Button
                                    key={channel}
                                    variant={selectedChannels.includes(channel) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onToggleChannel(channel)}
                                    className={`justify-start text-xs ${selectedChannels.includes(channel) ? 'bg-primary/20 text-primary border-primary hover:bg-primary/30' : ''}`}
                                >
                                    <span className="mr-2">{channelTypeIcons[channel]}</span>
                                    <span className="truncate">{channelTypeLabels[channel]}</span>
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Active Filters Row (Desktop) */}
                <div className="hidden lg:flex items-center gap-2">
                    {selectedChannels.slice(0, 3).map(channel => (
                        <div key={channel} className="text-[10px] font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground flex items-center gap-1 border border-white/5">
                            {channelTypeIcons[channel]} {channelTypeLabels[channel]}
                            <button onClick={() => onToggleChannel(channel)} className="hover:text-destructive ml-1">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {selectedChannels.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{selectedChannels.length - 3}</span>
                    )}
                </div>
            </div>

            {/* RIGHT: View & Actions */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">

                {/* Sort Dropdown */}
                <div className="bg-muted/50 p-1 rounded-lg flex items-center border border-white/5 mr-2">
                    <Select value={sortOrder} onValueChange={(v) => onSortChange(v as any)}>
                        <SelectTrigger className="h-8 border-none bg-transparent hover:bg-transparent shadow-none w-[140px] text-xs font-medium">
                            <SelectValue placeholder="Ordenar" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="date_asc">Cronológico (Próximos)</SelectItem>
                            <SelectItem value="date_desc">Mais Recentes (Novos)</SelectItem>
                            <SelectItem value="budget_desc">Maior Orçamento</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* View Toggle */}
                <div className="flex bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => onViewModeChange('cards')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'cards' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Cards
                    </button>
                    <button
                        onClick={() => onViewModeChange('calendar')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Calendário
                    </button>
                    <button
                        onClick={() => onViewModeChange('kanban')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Kanban
                    </button>
                    <button
                        onClick={() => onViewModeChange('financial')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'financial' ? 'bg-emerald-500/10 text-emerald-600 shadow border border-emerald-500/20' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Financeiro
                    </button>
                </div>

                <div className="h-8 w-[1px] bg-border/50" />

                {/* Primary Action */}
                <Button
                    onClick={onNewStrategy}
                    className="gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all text-white font-semibold relative overflow-hidden group"
                    style={{
                        background: 'var(--company-gradient)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                >
                    {/* Shine Effect Overlay */}
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />

                    <Plus className="w-4 h-4 relative z-20" />
                    <span className="hidden sm:inline relative z-20">Nova Estratégia</span>
                    <span className="sm:hidden relative z-20">Nova</span>
                </Button>
            </div>
        </div>
    );
}
