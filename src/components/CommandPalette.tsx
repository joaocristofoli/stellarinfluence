import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    X,
    Users,
    Calendar,
    Settings,
    DollarSign,
    Building2,
    LayoutDashboard,
    Plus,
    ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

/**
 * Command item definition
 */
export interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    shortcut?: string;
    action: () => void;
    category: 'navigation' | 'action' | 'settings';
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    /** Additional custom commands */
    customCommands?: CommandItem[];
}

/**
 * CommandPalette - Global command palette for quick navigation and actions
 * 
 * @description
 * Provides a searchable command palette similar to VS Code's Cmd+P.
 * Includes navigation shortcuts, quick actions, and extensible custom commands.
 * 
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * 
 * useKeyboardShortcuts([
 *   { keys: 'meta+k', handler: () => setOpen(true) }
 * ]);
 * 
 * return <CommandPalette isOpen={open} onClose={() => setOpen(false)} />;
 * ```
 */
export function CommandPalette({ isOpen, onClose, customCommands = [] }: CommandPaletteProps) {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();

    // Default commands
    const defaultCommands: CommandItem[] = useMemo(() => [
        // Navigation
        {
            id: 'nav-dashboard',
            label: 'Dashboard',
            description: 'Visão geral de projetos',
            icon: <LayoutDashboard className="w-4 h-4" />,
            shortcut: 'D',
            action: () => { navigate('/admin/dashboard'); onClose(); },
            category: 'navigation',
        },
        {
            id: 'nav-creators',
            label: 'Criadores',
            description: 'Gerenciar parceiros de mídia',
            icon: <Users className="w-4 h-4" />,
            shortcut: 'C',
            action: () => { navigate('/admin?tab=creators'); onClose(); },
            category: 'navigation',
        },
        {
            id: 'nav-marketing',
            label: 'Planejador de Marketing',
            description: 'Estratégias e campanhas',
            icon: <Building2 className="w-4 h-4" />,
            action: () => { navigate('/admin/marketing'); onClose(); },
            category: 'navigation',
        },
        {
            id: 'nav-bookings',
            label: 'Reservas',
            description: 'Solicitações de colaboração',
            icon: <Calendar className="w-4 h-4" />,
            action: () => { navigate('/admin?tab=bookings'); onClose(); },
            category: 'navigation',
        },
        {
            id: 'nav-pricing',
            label: 'Preços',
            description: 'Gerenciar planos',
            icon: <DollarSign className="w-4 h-4" />,
            action: () => { navigate('/admin?tab=pricing'); onClose(); },
            category: 'navigation',
        },
        {
            id: 'nav-settings',
            label: 'Configurações',
            description: 'Branding, temas, plataformas',
            icon: <Settings className="w-4 h-4" />,
            action: () => { navigate('/admin?tab=branding'); onClose(); },
            category: 'settings',
        },
        // Actions
        {
            id: 'action-new-creator',
            label: 'Novo Criador',
            description: 'Cadastrar influenciador',
            icon: <Plus className="w-4 h-4" />,
            shortcut: 'N',
            action: () => { navigate('/admin/creators/new'); onClose(); },
            category: 'action',
        },
    ], [navigate, onClose]);

    // Combine and filter commands
    const allCommands = useMemo(() =>
        [...defaultCommands, ...customCommands],
        [defaultCommands, customCommands]
    );

    const filteredCommands = useMemo(() => {
        if (!search.trim()) return allCommands;

        const lowerSearch = search.toLowerCase();
        return allCommands.filter(cmd =>
            cmd.label.toLowerCase().includes(lowerSearch) ||
            cmd.description?.toLowerCase().includes(lowerSearch)
        );
    }, [allCommands, search]);

    // Reset selection when search changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    // Reset search when opening
    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    Math.min(prev + 1, filteredCommands.length - 1)
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    }, [filteredCommands, selectedIndex, onClose]);

    // Group commands by category
    const groupedCommands = useMemo(() => {
        const groups: Record<string, CommandItem[]> = {
            navigation: [],
            action: [],
            settings: [],
        };

        filteredCommands.forEach(cmd => {
            groups[cmd.category].push(cmd);
        });

        return groups;
    }, [filteredCommands]);

    const categoryLabels: Record<string, string> = {
        navigation: 'Navegação',
        action: 'Ações',
        settings: 'Configurações',
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            {/* Palette */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.15 }}
                className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
            >
                <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                    {/* Search Input */}
                    <div className="flex items-center px-4 border-b border-border">
                        <Search className="w-5 h-5 text-muted-foreground" />
                        <Input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite um comando ou pesquise..."
                            className="border-0 focus-visible:ring-0 text-base"
                        />
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-muted rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Commands List */}
                    <div className="max-h-80 overflow-y-auto py-2">
                        {filteredCommands.length === 0 ? (
                            <div className="px-4 py-8 text-center text-muted-foreground">
                                Nenhum comando encontrado
                            </div>
                        ) : (
                            Object.entries(groupedCommands).map(([category, commands]) =>
                                commands.length > 0 && (
                                    <div key={category} className="mb-2">
                                        <div className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase">
                                            {categoryLabels[category]}
                                        </div>
                                        {commands.map((cmd, idx) => {
                                            const globalIndex = filteredCommands.indexOf(cmd);
                                            const isSelected = globalIndex === selectedIndex;

                                            return (
                                                <button
                                                    key={cmd.id}
                                                    onClick={cmd.action}
                                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${isSelected
                                                        ? 'bg-accent/10 text-accent'
                                                        : 'hover:bg-muted'
                                                        }`}
                                                >
                                                    <span className={isSelected ? 'text-accent' : 'text-muted-foreground'}>
                                                        {cmd.icon}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium">{cmd.label}</div>
                                                        {cmd.description && (
                                                            <div className="text-xs text-muted-foreground truncate">
                                                                {cmd.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {cmd.shortcut && (
                                                        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted rounded border border-border">
                                                            ⌘{cmd.shortcut}
                                                        </kbd>
                                                    )}
                                                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-muted-foreground/50'
                                                        }`} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )
                            )
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground flex items-center gap-4">
                        <span>↑↓ navegar</span>
                        <span>↵ selecionar</span>
                        <span>esc fechar</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default CommandPalette;
