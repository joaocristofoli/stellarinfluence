/**
 * ============================================================
 * LUXURY OS: SIDEBAR NAVIGATION
 * ============================================================
 * A cinematographic navigation experience.
 * 
 * Features:
 * - Glassmorphic container with film grain
 * - Physics-based menu item animations
 * - Contextual glow States on active items
 * - Emergence effect on hover (Z-axis lift)
 * ============================================================
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';
import {
    Users, DollarSign, Calendar, LogOut, Plus,
    Settings, LayoutDashboard, Building2, Landmark,
    ChevronRight, Home, Command, Sun, Moon, Monitor
} from 'lucide-react';

// ============================================================
// SPRING CONFIGURATIONS
// ============================================================
const springConfig = {
    gentle: { type: 'spring', stiffness: 120, damping: 20 },
    snappy: { type: 'spring', stiffness: 300, damping: 30 },
    stiff: { type: 'spring', stiffness: 400, damping: 35 },
};

// ============================================================
// MENU STRUCTURE
// ============================================================
const menuItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/admin?tab=dashboard',
    },
    {
        id: 'influencers',
        label: 'Criadores',
        icon: Users,
        path: '/admin?tab=creators',
        children: [
            { id: 'list', label: 'Listar Todos', path: '/admin?tab=creators' },
            { id: 'new', label: 'Adicionar Novo', path: '/admin/creators/new', external: true },
        ],
    },
    {
        id: 'marketing',
        label: 'Marketing',
        icon: Building2,
        path: '/admin/marketing',
        external: true,
    },
    {
        id: 'toledo',
        label: 'Prefeitura',
        icon: Landmark,
        path: '/admin/toledo',
        external: true,
    },
    {
        id: 'bookings',
        label: 'Reservas',
        icon: Calendar,
        path: '/admin?tab=bookings',
    },
    {
        id: 'settings',
        label: 'Configurações',
        icon: Settings,
        path: '/admin?tab=settings',
    },
    {
        id: 'pricing',
        label: 'Preços',
        icon: DollarSign,
        path: '/admin?tab=pricing',
    },
];

// ============================================================
// MENU ITEM COMPONENT
// ============================================================
interface MenuItemProps {
    item: typeof menuItems[0];
    isActive: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    onNavigate: (path: string, external?: boolean) => void;
}

const MenuItem = ({ item, isActive, isExpanded, onToggle, onNavigate }: MenuItemProps) => {
    const hasChildren = item.children && item.children.length > 0;

    return (
        <div>
            <motion.button
                onClick={() => hasChildren ? onToggle() : onNavigate(item.path, item.external)}
                whileHover={{ x: 4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={springConfig.snappy}
                className={cn(
                    // Base
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium",
                    "transition-colors duration-200",
                    // Glassmorphic hover
                    "hover:bg-white/5",
                    // Active state with glow
                    isActive && [
                        "bg-gradient-to-r from-accent/20 via-accent/10 to-transparent",
                        "border-l-2 border-accent",
                        "text-accent",
                        // Subtle glow
                        "shadow-[inset_0_0_20px_rgba(255,107,53,0.1)]"
                    ],
                    !isActive && "text-muted-foreground hover:text-foreground"
                )}
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: isActive ? [0, -10, 10, 0] : 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <item.icon className="w-5 h-5" />
                    </motion.div>
                    <span>{item.label}</span>
                </div>

                {hasChildren && (
                    <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={springConfig.stiff}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </motion.div>
                )}

                {item.external && !hasChildren && (
                    <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">
                        →
                    </span>
                )}
            </motion.button>

            {/* Submenu */}
            <AnimatePresence>
                {hasChildren && isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={springConfig.gentle}
                        className="overflow-hidden ml-4 mt-1"
                    >
                        {item.children!.map((child, index) => (
                            <motion.button
                                key={child.id}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.05, ...springConfig.snappy }}
                                whileHover={{ x: 4 }}
                                onClick={() => onNavigate(child.path, child.external)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm",
                                    "text-muted-foreground hover:text-foreground hover:bg-white/5",
                                    "transition-colors duration-200"
                                )}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                                <span>{child.label}</span>
                                {child.external && (
                                    <span className="ml-auto text-xs text-accent">→</span>
                                )}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================================
// THEME TOGGLE
// ============================================================
const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    const options = [
        { value: 'light', icon: Sun, label: 'Claro' },
        { value: 'dark', icon: Moon, label: 'Escuro' },
        { value: 'system', icon: Monitor, label: 'Auto' },
    ];

    return (
        <div className="flex gap-1 p-1 rounded-lg bg-white/5">
            {options.map(opt => (
                <motion.button
                    key={opt.value}
                    onClick={() => setTheme(opt.value as any)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs font-medium",
                        "transition-colors duration-200",
                        theme === opt.value
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <opt.icon className="w-3.5 h-3.5" />
                </motion.button>
            ))}
        </div>
    );
};

// ============================================================
// MAIN SIDEBAR
// ============================================================
interface LuxurySidebarProps {
    activeSection: string;
    onNavigate: (path: string) => void;
}

export function LuxurySidebar({ activeSection, onNavigate }: LuxurySidebarProps) {
    const navigate = useNavigate();
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['influencers']);

    const handleToggle = (id: string) => {
        setExpandedMenus(prev =>
            prev.includes(id)
                ? prev.filter(m => m !== id)
                : [...prev, id]
        );
    };

    const handleNavigate = (path: string, external?: boolean) => {
        if (external) {
            navigate(path);
        } else {
            // Extract tab from path like "/admin?tab=creators"
            const url = new URL(path, window.location.origin);
            const tab = url.searchParams.get('tab');
            if (tab) {
                onNavigate(tab);
            } else {
                navigate(path);
            }
        }
    };

    const isActive = (item: typeof menuItems[0]) => {
        if (item.path.includes(`tab=${activeSection}`)) return true;
        if (item.children?.some(c => c.path.includes(`tab=${activeSection}`))) return true;
        return false;
    };

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={springConfig.gentle}
            className={cn(
                // Dimensions
                "w-64 h-screen flex flex-col",
                // Glassmorphism
                "bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-xl",
                "border-r border-white/5",
                // Film grain
                "film-grain"
            )}
        >
            {/* Logo */}
            <div className="p-6 border-b border-white/5">
                <motion.h1
                    className="text-xl font-black text-gradient"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Eternizar
                </motion.h1>
                <p className="text-xs text-muted-foreground mt-1">
                    Marketing OS
                </p>
            </div>

            {/* Command Palette Hint */}
            <div className="px-4 py-3">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg",
                        "bg-white/5 border border-white/5",
                        "text-xs text-muted-foreground",
                        "cursor-pointer hover:bg-white/10 transition-colors"
                    )}
                >
                    <Command className="w-3.5 h-3.5" />
                    <span>Buscar...</span>
                    <kbd className="ml-auto px-1.5 py-0.5 rounded bg-white/10 text-[10px]">
                        ⌘K
                    </kbd>
                </motion.div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-2">
                <nav className="space-y-1">
                    {menuItems.map(item => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            isActive={isActive(item)}
                            isExpanded={expandedMenus.includes(item.id)}
                            onToggle={() => handleToggle(item.id)}
                            onNavigate={handleNavigate}
                        />
                    ))}
                </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 space-y-3">
                <ThemeToggle />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="w-full justify-start text-muted-foreground hover:text-foreground btn-glow"
                >
                    <Home className="w-4 h-4 mr-2" />
                    Voltar ao Site
                </Button>
            </div>
        </motion.aside>
    );
}

export default LuxurySidebar;
