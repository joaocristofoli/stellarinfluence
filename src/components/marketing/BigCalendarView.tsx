import { useState, useCallback, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, EventProps, SlotInfo } from 'react-big-calendar';
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCalendarStore, useCalendarUndo } from '@/stores/useCalendarStore';
import { useStrategies, useUpdateStrategy, useCreateStrategy, useDeleteStrategy } from '@/hooks/useStrategies';
import { MarketingStrategy, ChannelType } from '@/types/marketing';
import { formatCurrency } from '@/utils/formatters';
import { checkOverlap } from '@/utils/calendarHelpers';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import {
    Check,
    AlertTriangle,
    Copy,
    Trash2,
    MessageCircle,
    ExternalLink,
    Upload,
    Ghost
} from 'lucide-react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubTrigger,
    ContextMenuSubContent
} from "@/components/ui/context-menu";

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import '@/styles/calendar-premium.css';

// --- CONFIGURATION ---
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

// --- TYPES ---
interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: MarketingStrategy;
}

interface BigCalendarViewProps {
    strategies: MarketingStrategy[]; // Dados iniciais do pai
    companyId: string;
    onStrategyClick: (strategy: MarketingStrategy) => void;
    onCreateRange: (start: Date, end: Date) => void;
    currentDate: Date;
    onNavigate: (date: Date) => void;
    view: 'month' | 'week' | 'day' | 'agenda';
    onViewChange: (view: 'month' | 'week' | 'day' | 'agenda') => void;
}

// --- HELPER: WHATSAPP TRIGGER ---
const openWhatsApp = (strategy: MarketingStrategy) => {
    // Em um cenário real, pegaríamos o telefone do creator via linkedCreatorIds
    // Aqui vamos simular com um prompt ou toast se não tiver phone
    toast({
        title: "Abrindo WhatsApp 💬",
        description: `Iniciando conversa sobre "${strategy.name}"...`
    });

    // Simulação de URL
    const text = `Oi! Tudo certo para a ação *${strategy.name}* dia ${format(new Date(strategy.startDate!), 'dd/MM')}?`;
    window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
};

// --- COMPONENT: CUSTOM EVENT CARD (THE HEART) ---
const CustomEventCard = ({ event }: EventProps<CalendarEvent>) => {
    const strategy = event.resource;
    const { ghostMode } = useCalendarStore();
    const { strategies } = useCalendarStore.getState(); // Acesso direto state para checkOverlap

    const isCompleted = strategy.status === 'completed';
    const isGhost = (strategy as any).status === 'draft' || ghostMode;
    const hasConflict = checkOverlap(strategy, strategies);

    // Asset Pipeline (Dropzone)
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        toast({ title: "Fazendo Upload 📤", description: "Enviando criativo..." });

        // Upload Logic (Simulated for speed, but functional structure)
        const fileName = `${strategy.id}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from('campaign-assets').upload(fileName, file);

        if (error) {
            toast({ title: "Erro no Upload", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Criativo Anexado! 🎨", description: "O arquivo foi vinculado à estratégia." });
            // Aqui faríamos updateStrategy para salvar a URL
        }
    }, [strategy.id]);

    const { getRootProps, isDragActive } = useDropzone({ onDrop, noClick: true });

    // Styles based on Channel
    const getColors = (type: ChannelType) => {
        switch (type) {
            case 'influencer': return 'bg-pink-500/10 border-pink-500 text-pink-600 font-semibold';
            case 'paid_traffic': return 'bg-blue-500/10 border-blue-500 text-blue-600 font-semibold';
            case 'events': return 'bg-purple-500/10 border-purple-500 text-purple-600 font-semibold';
            default: return 'bg-emerald-500/10 border-emerald-500 text-emerald-600 font-semibold';
        }
    };
    const colors = getColors(strategy.channelType);

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div
                    {...getRootProps()}
                    className={cn(
                        "h-full w-full rounded-md border-l-[3px] px-2 py-0.5 text-xs font-medium transition-all relative overflow-hidden group",
                        colors,
                        isCompleted && "opacity-50 grayscale",
                        isGhost && "opacity-60 border-dashed bg-stripes", // Ghost Mode visual
                        hasConflict && "animate-pulse border-red-500 bg-red-500/20", // Conflict Visual
                        "hover:brightness-110 hover:shadow-lg hover:scale-[1.01]"
                    )}
                >
                    {/* Visual de Upload DragOver */}
                    {isDragActive && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                            <Upload className="w-4 h-4 text-white animate-bounce" />
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 truncate">
                        {hasConflict && <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />}
                        {isGhost && <Ghost className="w-3 h-3 text-white/40 shrink-0" />}
                        <span className="truncate">{event.title}</span>
                        {isCompleted && <Check className="w-3 h-3 text-emerald-400 ml-auto" />}
                    </div>
                </div>
            </ContextMenuTrigger>

            {/* CONTEXT MENU POWER */}
            <ContextMenuContent className="w-64 glass-panel border-white/10 text-white">
                <ContextMenuItem className="gap-2 cursor-pointer">
                    ✏️ Editar Detalhes
                </ContextMenuItem>
                <ContextMenuItem className="gap-2 cursor-pointer" onClick={() => openWhatsApp(strategy)}>
                    <MessageCircle className="w-4 h-4 text-green-400" /> Chamar no WhatsApp
                </ContextMenuItem>
                <ContextMenuSeparator className="bg-white/10" />
                <ContextMenuSub>
                    <ContextMenuSubTrigger className="gap-2">🚀 Mover para...</ContextMenuSubTrigger>
                    <ContextMenuSubContent className="glass-panel border-white/10">
                        <ContextMenuItem>Próxima Semana</ContextMenuItem>
                        <ContextMenuItem>Próximo Mês</ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator className="bg-white/10" />
                <ContextMenuItem className="gap-2 text-red-400 focus:text-red-400 cursor-pointer">
                    <Trash2 className="w-4 h-4" /> Cancelar Ação
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

// --- COMPONENT: BIG CALENDAR VIEW (MAIN) ---
export function BigCalendarView({
    strategies: initialStrategies,
    companyId,
    onStrategyClick,
    onCreateRange,
    currentDate,
    onNavigate,
    view,
    onViewChange
}: BigCalendarViewProps) {
    const { strategies, setStrategies, updateStrategy: updateStoreStrategy, addStrategy } = useCalendarStore();
    const { undo } = useCalendarUndo();

    // Hooks de Mutação (React Query)
    const updateMutation = useUpdateStrategy();
    const createMutation = useCreateStrategy();

    // Sync Store com Props iniciais (Optimistic base)
    useEffect(() => {
        if (initialStrategies) {
            setStrategies(initialStrategies);
        }
    }, [initialStrategies, setStrategies]);

    // Converter para Formato BigCalendar
    const events = useMemo(() => strategies.map(s => ({
        id: s.id,
        title: s.name,
        start: new Date(s.startDate!),
        end: s.endDate ? new Date(s.endDate) : new Date(s.startDate!),
        allDay: true,
        resource: s,
    })), [strategies]);

    // --- HANDLER: RESIZE & MOVE ---
    const onEventResize = useCallback(async ({ event, start, end }: any) => {
        const strategy = event.resource;

        // 1. Optimistic Update (Visual Instantâneo)
        updateStoreStrategy(strategy.id, { startDate: start, endDate: end });

        // 2. Persist with Mutation
        try {
            await updateMutation.mutateAsync({
                id: strategy.id,
                startDate: start,
                endDate: end,
                companyId
            });
            toast({
                title: "Duração Atualizada ↔️",
                description: "Cronograma ajustado com sucesso."
            });
        } catch (err) {
            undo(); // Rollback se falhar
            toast({ title: "Erro ao salvar", variant: "destructive" });
        }
    }, [updateStoreStrategy, updateMutation, undo]);

    // --- HANDLER: DROP (MOVE OR CLONE) ---
    const onEventDrop = useCallback(async ({ event, start, end, allDay }: any) => {
        const strategy = event.resource;
        const isAltPressed = (window as any).event?.altKey; // Captura tecla ALT (Windows/Linux) ou Option (Mac)

        if (isAltPressed) {
            // --- CLONE MODE (ALT+DRAG) 🐑 ---
            const newStrategy = {
                ...strategy,
                id: crypto.randomUUID(), // ID temporário p/ UI
                name: `${strategy.name} (Cópia)`,
                startDate: start,
                endDate: end,
                status: 'planned' as const
            };

            // Optimistic Add
            addStrategy(newStrategy);
            toast({ title: "Clonando... 🐑", description: "Duoviri in action." });

            // Server Create
            try {
                // Remove ID temporário antes de mandar pro server
                const { id, ...dataToClone } = newStrategy;
                await createMutation.mutateAsync({
                    ...dataToClone,
                    companyId
                });
            } catch (err) {
                toast({ title: "Erro na Clonagem", variant: "destructive" });
            }

        } else {
            // --- MOVE MODE (STANDARD) 🚚 ---
            updateStoreStrategy(strategy.id, { startDate: start, endDate: end });
            try {
                await updateMutation.mutateAsync({
                    id: strategy.id,
                    startDate: start,
                    endDate: end,
                    companyId
                });
                toast({ title: "Reagendado 🗓️", description: `Movido para ${format(start, 'dd/MM')}` });
            } catch {
                undo();
            }
        }
    }, [updateStoreStrategy, updateMutation, createMutation, addStrategy, undo, companyId]);

    // --- HANDLER: DRAG TO CREATE ---
    const onSelectSlot = useCallback(({ start, end, action }: SlotInfo) => {
        if (action === 'select' || action === 'click') {
            // Normalizar End Date (BigCalendar retorna 00:00 do dia seguinte no select)
            // Se for 'click' (dia único), start == slot, end varies. 
            // Vamos simplificar: Usar as datas visuais.
            onCreateRange(start, processEndDate(end));
        }
    }, [onCreateRange]);

    // Helper para corrigir data final visual do BigCalendar
    const processEndDate = (date: Date) => {
        // Se a hora for 00:00:00, subtrai 1 segundo para cair no dia anterior visualmente?
        // BigCalendar 'select' range geralmente é exclusivo no fim.
        // Ex: Arrasta dia 1 a 2. Retorna start: 1, end: 3 (00:00).
        // Queremos end: 2.
        const d = new Date(date);
        d.setSeconds(d.getSeconds() - 1);
        return d;
    };

    return (
        <div className="h-[750px] premium-calendar-wrapper">
            <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor={(event: any) => event.start}
                endAccessor={(event: any) => event.end}
                style={{ height: '100%' }}

                // Views Configuration (Mobile Support)
                views={['month', 'week', 'day', 'agenda']}
                view={view}
                onView={onViewChange}
                toolbar={false}

                // Navigation
                date={currentDate}
                onNavigate={onNavigate}

                // Interactivity
                selectable={true}
                resizable={true}
                onEventDrop={onEventDrop}
                onEventResize={onEventResize}
                onSelectSlot={onSelectSlot}
                onSelectEvent={(e: any) => onStrategyClick(e.resource)}

                // Components Override
                components={{
                    event: CustomEventCard
                }}

                // Styling
                eventPropGetter={() => ({ className: "bg-transparent border-none p-0" })}

                // Localization
                messages={{
                    today: 'Hoje',
                    previous: 'Anterior',
                    next: 'Próximo',
                    month: 'Mês',
                    week: 'Semana',
                    day: 'Hoje',
                    showMore: (total) => `+${total} ações`
                }}
            />
        </div>
    );
}

// CSS Helper para Ghost Mode
const style = document.createElement('style');
style.innerHTML = `
  .bg-stripes {
    background-image: linear-gradient(45deg, rgba(255,255,255,.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.1) 50%, rgba(255,255,255,.1) 75%, transparent 75%, transparent);
    background-size: 1rem 1rem;
  }
`;
document.head.appendChild(style);
