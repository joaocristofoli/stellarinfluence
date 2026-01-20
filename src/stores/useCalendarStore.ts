import { create } from 'zustand';
import { temporal, TemporalState } from 'zundo';
import { MarketingStrategy } from '@/types/marketing';
import { toast } from '@/hooks/use-toast';

interface DragState {
    isDragging: boolean;
    start: Date | null;
    end: Date | null;
}

interface CalendarState {
    // Data
    strategies: MarketingStrategy[];
    ghostMode: boolean; // Se true, mostra rascunhos com opacidade
    currentDate: Date; // Persistência de navegação
    dragState: DragState;

    // Actions
    setStrategies: (strategies: MarketingStrategy[]) => void;
    updateStrategy: (id: string, data: Partial<MarketingStrategy>) => void;
    addStrategy: (strategy: MarketingStrategy) => void;
    removeStrategy: (id: string) => void;

    // UI Actions
    toggleGhostMode: () => void;
    setCurrentDate: (date: Date) => void;
    setDragState: (state: DragState) => void;

    // Helper para resetar (útil ao desmontar)
    reset: () => void;
}

export const useCalendarStore = create<CalendarState>()(
    temporal(
        (set) => ({
            strategies: [],
            ghostMode: false,
            currentDate: new Date(),
            dragState: { isDragging: false, start: null, end: null },

            setStrategies: (strategies) => set({ strategies }),

            addStrategy: (strategy) => set((state) => ({
                strategies: [...state.strategies, strategy]
            })),

            updateStrategy: (id, data) => set((state) => ({
                strategies: state.strategies.map((s) =>
                    s.id === id ? { ...s, ...data } : s
                )
            })),

            removeStrategy: (id) => set((state) => ({
                strategies: state.strategies.filter((s) => s.id !== id)
            })),

            toggleGhostMode: () => set((state) => ({ ghostMode: !state.ghostMode })),

            setCurrentDate: (date) => set({ currentDate: date }),

            setDragState: (dragState) => set({ dragState }),

            reset: () => set({ strategies: [], ghostMode: false, dragState: { isDragging: false, start: null, end: null } })
        }),
        {
            limit: 50, // Lembrar 50 passos
            partialize: (state) => ({ strategies: state.strategies }), // Só rastreia undo/redo das estratégias
        }
    )
);

// Hook helper para Undo/Redo na UI
export const useCalendarUndo = () => {
    // Acessando a store temporal
    const { undo, redo, pastStates, futureStates, clear } = useCalendarStore.temporal.getState();

    return {
        undo: () => {
            undo();
            toast({ title: "Ação desfeita", description: "Voltamos no tempo. 🕰️" });
        },
        redo: () => {
            redo();
            toast({ title: "Ação refeita", description: "Voltamos para o futuro. 🚀" });
        },
        canUndo: pastStates.length > 0,
        canRedo: futureStates.length > 0,
        clearHistory: clear
    };
};
