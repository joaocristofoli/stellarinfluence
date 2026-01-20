/**
 * ============================================================
 * LUXURY OS: BENTO GRID DASHBOARD
 * ============================================================
 * A cinematographic command center for marketing operations.
 * 
 * Design Philosophy:
 * - Bento Grid: Spatial hierarchy inspired by Apple/Linear
 * - Z-Axis Depth: Elements "emerge" with layered shadows
 * - Physics Motion: Spring-based animations for tactile feel
 * - Film Grain: Subtle texture for analog luxury
 * ============================================================
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCreators } from '@/hooks/useCreators';
import { useCompanies } from '@/hooks/useCompanies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import {
    Users, TrendingUp, Calendar, DollarSign,
    ArrowUpRight, Sparkles, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// SPRING CONFIGURATIONS (Physics-based motion)
// ============================================================
const springConfig = {
    gentle: { type: 'spring', stiffness: 120, damping: 20 },
    snappy: { type: 'spring', stiffness: 300, damping: 30 },
    bouncy: { type: 'spring', stiffness: 400, damping: 25, mass: 0.8 },
};

// ============================================================
// BENTO CARD: Reusable Luxury Card Component
// ============================================================
interface BentoCardProps {
    children: React.ReactNode;
    className?: string;
    span?: 1 | 2 | 3;
    tall?: boolean;
    featured?: boolean;
    onClick?: () => void;
}

const BentoCard = ({ children, className, span = 1, tall, featured, onClick }: BentoCardProps) => {
    const spanClass = span === 2 ? 'bento-span-2' : span === 3 ? 'bento-span-3' : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={springConfig.snappy}
            onClick={onClick}
            className={cn(
                // Base
                "relative rounded-2xl overflow-hidden cursor-pointer",
                // Glassmorphism + Depth
                "bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl",
                "border border-white/10",
                // Emergence shadow
                "shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
                // Film grain child
                "film-grain",
                // Bento sizing
                spanClass,
                tall && "bento-tall",
                featured && "ring-1 ring-accent/30",
                className
            )}
        >
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};

// ============================================================
// STAT CARD: KPI Display with Animated Counter
// ============================================================
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: number;
    color?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, color = "accent" }: StatCardProps) => (
    <BentoCard className="p-6">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-muted-foreground font-medium mb-2">{title}</p>
                <motion.p
                    className="text-3xl font-black tabular-nums text-foreground"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, ...springConfig.gentle }}
                >
                    {value}
                </motion.p>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 mt-2 text-sm",
                        trend > 0 ? "text-green-400" : "text-red-400"
                    )}>
                        <ArrowUpRight className={cn("w-4 h-4", trend < 0 && "rotate-180")} />
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
            <div className={cn(
                "p-3 rounded-xl",
                `bg-${color}/10`
            )}>
                <Icon className={cn("w-6 h-6", `text-${color}`)} />
            </div>
        </div>
    </BentoCard>
);

// ============================================================
// CREATOR SPOTLIGHT: Featured Creator with Video BG
// ============================================================
interface CreatorSpotlightProps {
    creator: {
        id: string;
        name: string;
        image_url?: string;
        category?: string;
        total_followers?: string;
        engagement_rate?: string;
    };
}

const CreatorSpotlight = ({ creator }: CreatorSpotlightProps) => {
    const navigate = useNavigate();

    return (
        <BentoCard
            span={2}
            tall
            featured
            onClick={() => navigate(`/admin/creators/${creator.id}`)}
            className="min-h-[320px]"
        >
            {/* Background Image with Blur */}
            <div className="absolute inset-0">
                <img
                    src={creator.image_url}
                    alt=""
                    className="w-full h-full object-cover opacity-30 blur-sm scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full p-6 flex flex-col justify-end">
                <Badge className="w-fit mb-3 bg-accent/20 text-accent border-accent/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Em Destaque
                </Badge>

                <div className="flex items-end gap-4">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={springConfig.bouncy}
                    >
                        <Avatar className="w-20 h-20 border-2 border-white/20 shadow-2xl">
                            <AvatarImage src={creator.image_url} />
                            <AvatarFallback>{creator.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                    </motion.div>

                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-foreground mb-1">{creator.name}</h3>
                        <p className="text-muted-foreground text-sm">{creator.category}</p>

                        <div className="flex gap-4 mt-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Seguidores</p>
                                <p className="text-lg font-bold tabular-nums">{creator.total_followers}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Engajamento</p>
                                <p className="text-lg font-bold tabular-nums">{creator.engagement_rate}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BentoCard>
    );
};

// ============================================================
// MAIN DASHBOARD: Bento Grid Layout
// ============================================================
export function LuxuryDashboard() {
    const navigate = useNavigate();
    const { data: creators = [] } = useCreators();
    const { data: companies = [] } = useCompanies();

    // Get featured creator (first approved)
    const featuredCreator = creators.find(c => c.approval_status === 'approved') || creators[0];

    // KPI calculations
    const totalCreators = creators.length;
    const approvedCreators = creators.filter(c => c.approval_status === 'approved').length;
    const totalCompanies = companies.length;

    return (
        <div className="p-6 film-grain">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springConfig.gentle}
                className="mb-8"
            >
                <h1 className="text-4xl font-black text-foreground mb-2">
                    Command Center
                </h1>
                <p className="text-muted-foreground">
                    Visão geral do seu ecossistema de marketing
                </p>
            </motion.div>

            {/* Bento Grid */}
            <div className="bento-grid bento-grid-dense gap-4">
                {/* KPI Stats Row */}
                <StatCard
                    title="Criadores"
                    value={totalCreators}
                    icon={Users}
                    trend={12}
                />
                <StatCard
                    title="Aprovados"
                    value={approvedCreators}
                    icon={Zap}
                    color="green-400"
                />
                <StatCard
                    title="Empresas"
                    value={totalCompanies}
                    icon={TrendingUp}
                    color="blue-400"
                />

                {/* Featured Creator Spotlight */}
                {featuredCreator && (
                    <CreatorSpotlight creator={featuredCreator} />
                )}

                {/* Quick Actions */}
                <BentoCard className="p-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">Ações Rápidas</h4>
                    <div className="space-y-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start btn-glow"
                            onClick={() => navigate('/admin/creators/new')}
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Novo Criador
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start btn-glow"
                            onClick={() => navigate('/admin/marketing')}
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Planejar Campanha
                        </Button>
                    </div>
                </BentoCard>

                {/* Recent Creators Grid */}
                <BentoCard span={2} className="p-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">Últimos Criadores</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        <AnimatePresence>
                            {creators.slice(0, 6).map((creator, index) => (
                                <motion.div
                                    key={creator.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05, ...springConfig.bouncy }}
                                    whileHover={{ scale: 1.1, y: -4 }}
                                    className="flex-shrink-0 cursor-pointer"
                                    onClick={() => navigate(`/admin/creators/${creator.id}`)}
                                >
                                    <Avatar className="w-14 h-14 border-2 border-white/10 hover:border-accent/50 transition-colors">
                                        <AvatarImage src={creator.image_url || ''} />
                                        <AvatarFallback>{creator.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </BentoCard>
            </div>
        </div>
    );
}

export default LuxuryDashboard;
