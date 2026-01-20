import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
    MarketingStrategy,
    MarketingCampaign,
    ChannelType,
    channelTypeLabels,
    channelTypeIcons
} from '@/types/marketing';
import { generateMarketingIdeas, AIStrategySuggestion } from '@/utils/aiGenerator';
import {
    Sparkles, Loader2, Users, FolderKanban, Calendar as CalendarIcon,
    AlertTriangle, DollarSign, PieChart, Clock, AlignLeft, LayoutGrid, Lock
} from 'lucide-react';

import { useToast } from "@/hooks/use-toast";
import { useCreators } from "@/hooks/useCreators";
import { PROFILE_CATEGORIES } from "@/types/profileTypes";
import { Creator } from '@/types/creator';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { GlassInput } from '@/components/ui/glass-input';
import { motion, AnimatePresence } from "framer-motion";
import { CreatorCartItem } from './CreatorCartItem';
import { StrategyDeliverable } from '@/types/marketing';
import { formatCurrency } from '@/utils/formatters';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface StrategyFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (strategy: Omit<MarketingStrategy, 'id' | 'createdAt' | 'updatedAt'>) => void;
    editingStrategy?: MarketingStrategy | null;
    existingStrategies: MarketingStrategy[];
    companyId: string;
    campaigns?: MarketingCampaign[];
    defaultCampaignId?: string | null;
    defaultDate?: Date | null;
}

const channelTypes: ChannelType[] = [
    'influencer',
    'paid_traffic',
    'flyers',
    'physical_media',
    'events',
    'partnerships',
    'social_media',
    'email_marketing',
    'radio',
    'sound_car',
    'promoters',
];

// ⚡ PERFORMANCE FIX: Debounced Input to prevent re-rendering the whole form on every keystroke
const DebouncedGlassInput = ({ value, onChange, delay = 300, ...props }: any) => {
    const [localValue, setLocalValue] = useState(value);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            onChange({ target: { value: newValue } });
        }, delay);
    };

    return <GlassInput {...props} value={localValue} onChange={handleChange} />;
};

const DebouncedTextarea = ({ value, onChange, delay = 300, ...props }: any) => {
    const [localValue, setLocalValue] = useState(value);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            onChange({ target: { value: newValue } });
        }, delay);
    };


    return <Textarea {...props} value={localValue} onChange={handleChange} />;
};

const TabContainer = ({ children, value }: { children: React.ReactNode; value: string }) => (
    <TabsContent value={value} className="mt-0 focus-visible:ring-0">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 pt-4 px-1"
        >
            {children}
        </motion.div>
    </TabsContent>
);

export function StrategyForm({
    open,
    onClose,
    onSave,
    editingStrategy,
    existingStrategies,
    companyId,
    campaigns = [],
    defaultCampaignId = null,
    defaultDate = null,
}: StrategyFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        channelType: 'influencer' as ChannelType,
        budget: 0,
        responsible: '',
        description: '',
        howToDo: '',
        whenToDo: '',
        whyToDo: '',
        connections: [] as string[],
        status: 'planned' as 'planned' | 'in_progress' | 'completed',
        campaignId: null as string | null,
        startDate: '' as string,
        endDate: '' as string,
        linkedCreatorIds: [] as string[],
        agencyFeePercentage: 0,
        taxRate: 6,
        mediaBudget: 0,
        contentFormat: '' as string, // Kept for legacy compatibility
        deliverables: [] as StrategyDeliverable[], // New Cart System 🛒
    });

    const [activeTab, setActiveTab] = useState("general");
    const [creatorFilter, setCreatorFilter] = useState<string>('all');
    const { toast } = useToast();
    const { data: creators = [], isLoading: loadingCreators } = useCreators(true);

    // Auto-Pricing Logic (Cart Version) 🛒
    useEffect(() => {
        // Auto-sum items in the cart
        const cartTotal = formData.deliverables.reduce((acc, item) => acc + item.price, 0);

        // Only auto-update if total > 0.
        // If the user manually edits the budget, we might want to respect that, 
        // BUT for the "Cart" model, the budget is usually the sum of items.
        // We will FORCE the budget to match the cart for now to ensure consistency.
        if (cartTotal > 0) {
            setFormData(prev => ({ ...prev, budget: cartTotal }));
        }
    }, [formData.deliverables]);

    // Memoize Filtered Creators List 🧠
    // This was the performance killer (re-calculating on every keystroke)
    const filteredCreators = useMemo(() => {
        return creators.filter(c =>
            creatorFilter === 'all' ||
            (c.category && c.category.toLowerCase().includes(creatorFilter)) ||
            (c as any).profile_type === creatorFilter
        );
    }, [creators, creatorFilter]);

    // Financial Calculation Logic
    useEffect(() => {
        const total = Number(formData.budget);
        const fee = total * (formData.agencyFeePercentage / 100);
        const tax = total * (formData.taxRate / 100);
        const media = total - fee - tax;

        setFormData(prev => {
            if (Math.abs(prev.mediaBudget - media) < 0.01) return prev;
            return { ...prev, mediaBudget: media };
        });
    }, [formData.budget, formData.agencyFeePercentage, formData.taxRate]);

    const [aiLoading, setAiLoading] = useState(false);
    const [showAiDialog, setShowAiDialog] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleCreatorSelect = (creatorId: string) => {
        const creator = creators.find(c => c.id === creatorId);
        if (!creator) return;

        // Allow multiple formats for same creator? Yes.
        // But maybe warn if adding duplicate? 

        // Default Format Logic
        const defaultFormat = 'story';
        let initialPrice = 0;

        // Try to find price in metadata
        if (creator.admin_metadata && creator.admin_metadata[`price_${defaultFormat}`]) {
            const raw = String(creator.admin_metadata[`price_${defaultFormat}`]);
            const price = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
            if (!isNaN(price)) initialPrice = price;
        }

        const newDeliverable: StrategyDeliverable = {
            creatorId,
            format: defaultFormat,
            price: initialPrice,
            quantity: 1,
            status: 'pending'
        };

        const newDeliverables = [...formData.deliverables, newDeliverable];
        const uniqueCreatorIds = [...new Set(newDeliverables.map(d => d.creatorId))];

        // Update Name/Description based on cart?
        // Maybe minimal updates to avoid overwriting user edits.

        setFormData(prev => ({
            ...prev,
            deliverables: newDeliverables,
            linkedCreatorIds: uniqueCreatorIds, // Keep synced for legacy
            channelType: 'influencer'
        }));
    };

    const handleCreatorRemove = useCallback((index: number) => {
        setFormData(prev => {
            const newDeliverables = [...prev.deliverables];
            newDeliverables.splice(index, 1);
            const uniqueCreatorIds = [...new Set(newDeliverables.map(d => d.creatorId))];

            return {
                ...prev,
                deliverables: newDeliverables,
                linkedCreatorIds: uniqueCreatorIds
            }
        });
    }, []);

    const handleDeliverableUpdate = useCallback((index: number, updated: StrategyDeliverable) => {
        setFormData(prev => {
            const newDeliverables = [...prev.deliverables];
            newDeliverables[index] = updated;
            return { ...prev, deliverables: newDeliverables };
        });
    }, []);

    const handleGenerateAI = async () => {
        if (!formData.channelType) return;
        setAiLoading(true);
        try {
            const suggestions = await generateMarketingIdeas(
                "Sua Empresa",
                "Empresa local",
                formData.channelType,
                formData.budget > 0 ? formData.budget : undefined
            );
            // Auto-apply first suggestion for simplicity in this refactor
            const suggestion = suggestions[0];
            if (suggestion) {
                setFormData(prev => ({
                    ...prev,
                    name: suggestion.title,
                    description: suggestion.description,
                    howToDo: suggestion.howToDo,
                    whenToDo: suggestion.whenToDo,
                    whyToDo: suggestion.whyToDo,
                    budget: suggestion.suggestedBudget,
                }));
                toast({ title: 'Sugestão Aplicada', description: 'Conteúdo gerado via IA.' });
            }
        } catch (error) {
            toast({ title: 'Erro na IA', variant: 'destructive' });
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        if (editingStrategy) {
            setFormData({
                name: editingStrategy.name,
                channelType: editingStrategy.channelType,
                budget: editingStrategy.budget,
                responsible: editingStrategy.responsible,
                description: editingStrategy.description,
                howToDo: editingStrategy.howToDo,
                whenToDo: editingStrategy.whenToDo,
                whyToDo: editingStrategy.whyToDo,
                connections: editingStrategy.connections,
                status: editingStrategy.status,
                campaignId: editingStrategy.campaignId,
                startDate: editingStrategy.startDate ? new Date(editingStrategy.startDate).toISOString().split('T')[0] : '',
                endDate: editingStrategy.endDate ? new Date(editingStrategy.endDate).toISOString().split('T')[0] : '',
                linkedCreatorIds: editingStrategy.linkedCreatorIds || [],
                agencyFeePercentage: editingStrategy.agencyFeePercentage || 0,
                taxRate: editingStrategy.taxRate || 0,
                mediaBudget: editingStrategy.mediaBudget || editingStrategy.budget,
                contentFormat: '', // Default to empty on edit for now
                // Hydrate Cart
                deliverables: editingStrategy.deliverables || (editingStrategy.linkedCreatorIds || []).map(id => ({
                    creatorId: id,
                    format: 'story', // Default legacy format
                    price: 0,
                    status: 'pending'
                })),
            });
        } else {
            setFormData({
                name: '',
                channelType: 'influencer',
                budget: 0,
                responsible: '',
                description: '',
                howToDo: '',
                whenToDo: '',
                whyToDo: '',
                connections: [],
                status: 'planned',
                campaignId: defaultCampaignId,
                startDate: defaultDate ? defaultDate.toISOString().split('T')[0] : '',
                endDate: '',
                deliverables: [],
                agencyFeePercentage: 0,
                taxRate: 6,
                mediaBudget: 0,
                contentFormat: '',
            });
        }
    }, [editingStrategy, open, defaultCampaignId, defaultDate]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Nome obrigatório';
        if (!formData.startDate) newErrors.startDate = 'Data de início obrigatória';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            toast({ title: 'Campos obrigatórios', description: 'Verifique o formulário.', variant: 'destructive' });
            return;
        }

        const creatorSnapshots = formData.channelType === 'influencer' ? formData.linkedCreatorIds.reduce((acc, id) => {
            const c = creators.find(cr => cr.id === id);
            if (c) acc[id] = { captured_at: new Date().toISOString(), ...c };
            return acc;
        }, {} as Record<string, any>) : {};

        onSave({
            ...formData,
            companyId,
            startDate: formData.startDate ? new Date(formData.startDate) : null,
            endDate: formData.endDate ? new Date(formData.endDate) : null,
            // @ts-ignore
            creator_snapshots: creatorSnapshots,
            deliverables: formData.deliverables // Save Cart 🛒
        });
        onClose();
    };

    // Moved outside to prevent re-renders


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 bg-background border-border overflow-hidden">
                <DialogHeader className="p-6 pb-2 border-b border-border">
                    <DialogTitle className="font-display text-2xl flex items-center justify-between">
                        <span className="text-gradient-premium">
                            {editingStrategy ? 'Editar Estratégia' : 'Nova Estratégia'}
                        </span>
                        <div className="flex items-center gap-2">
                            {formData.channelType === 'influencer' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateAI}
                                    disabled={aiLoading}
                                    className="h-8 text-xs border-primary/20 hover:border-primary/50 hover:bg-primary/10 text-primary"
                                >
                                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1 text-primary" />}
                                    IA Magic
                                </Button>
                            )}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <div className="px-6 pt-4 border-b border-border">
                        <TabsList className="bg-muted/30 p-1 border border-border w-full justify-start h-auto">
                            <TabsTrigger value="general" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
                                <LayoutGrid className="w-4 h-4 mr-2" /> Geral
                            </TabsTrigger>
                            <TabsTrigger value="details" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
                                <AlignLeft className="w-4 h-4 mr-2" /> Detalhes
                            </TabsTrigger>
                            <TabsTrigger value="timeline" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
                                <Clock className="w-4 h-4 mr-2" /> Cronograma
                            </TabsTrigger>
                            <TabsTrigger value="financial" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
                                <DollarSign className="w-4 h-4 mr-2" /> Financeiro
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                        <AnimatePresence mode="wait">
                            <TabContainer value="general">
                                <div className="grid grid-cols-2 gap-6">
                                    <DebouncedGlassInput
                                        label="Nome da Ação"
                                        value={formData.name}
                                        onChange={(e: any) => {
                                            setFormData(prev => ({ ...prev, name: e.target.value }));
                                            if (errors.name) setErrors(prev => { const n = { ...prev }; delete n.name; return n; });
                                        }}
                                        placeholder="Ex: Lançamento Verão"
                                        error={errors.name}
                                        autoFocus
                                    />
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Canal</Label>
                                        <Select
                                            value={formData.channelType}
                                            onValueChange={(v: ChannelType) => setFormData(prev => ({ ...prev, channelType: v }))}
                                        >
                                            <SelectTrigger className="h-12 bg-background border-input hover:bg-muted/50 transition-colors">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {channelTypes.map(t => (
                                                    <SelectItem key={t} value={t}>
                                                        <span className="flex items-center gap-2">
                                                            {channelTypeIcons[t]} {channelTypeLabels[t]}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <DebouncedGlassInput
                                    label="Responsável"
                                    value={formData.responsible}
                                    onChange={(e: any) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                                    icon={<Users className="w-4 h-4" />}
                                />

                                {campaigns.length > 0 && (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Campanha (Pai)</Label>
                                        <Select
                                            value={formData.campaignId || 'none'}
                                            onValueChange={(v) => setFormData(prev => ({ ...prev, campaignId: v === 'none' ? null : v }))}
                                        >
                                            <SelectTrigger className="h-12 bg-background border-input hover:bg-muted/50 transition-colors">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Nenhuma</SelectItem>
                                                {campaigns.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Creator Cart Section 🛒 */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-2 text-primary uppercase text-xs font-semibold tracking-wider">
                                            <Users className="w-4 h-4 text-accent" />
                                            {formData.channelType === 'influencer' ? 'Carrinho de Influenciadores' : 'Parceiros'}
                                        </Label>
                                        <span className="text-xs text-muted-foreground">{formData.deliverables.length} itens</span>
                                    </div>

                                    {/* Creator Filter Chips */}
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        <button
                                            type="button"
                                            onClick={() => setCreatorFilter('all')}
                                            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors border ${creatorFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'}`}
                                        >
                                            Todos
                                        </button>
                                        {PROFILE_CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCreatorFilter(cat.id)}
                                                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors border flex items-center gap-1 ${creatorFilter === cat.id ? 'bg-accent/20 text-accent border-accent' : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'}`}
                                            >
                                                <span>{cat.icon}</span>
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Action: Add Creator */}
                                    <Select onValueChange={handleCreatorSelect}>
                                        <SelectTrigger className="bg-background border-input hover:bg-accent/5 h-12">
                                            <SelectValue placeholder="Adicionar ao carrinho..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredCreators.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name} ({c.category})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Cart List */}
                                    <div className="space-y-2 mt-2">
                                        {formData.deliverables.map((item, index) => {
                                            const creator = creators.find(c => c.id === item.creatorId);
                                            if (!creator) return null;
                                            return (
                                                <CreatorCartItem
                                                    key={`${item.creatorId}-${index}`}
                                                    creator={creator}
                                                    deliverable={item}
                                                    onRemove={() => handleCreatorRemove(index)}
                                                    onUpdate={(updated) => handleDeliverableUpdate(index, updated)}
                                                />
                                            );
                                        })}

                                        {formData.deliverables.length === 0 && (
                                            <div className="text-center py-8 border border-dashed border-border rounded-xl bg-muted/20">
                                                <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
                                                <p className="text-xs text-muted-foreground/50">Selecione influenciadores acima para configurar ações.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cart Total Preview */}
                                    {formData.deliverables.length > 0 && (
                                        <div className="flex justify-end pt-2">
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground uppercase">Subtotal do Carrinho</p>
                                                <p className="text-lg font-bold text-accent">
                                                    {formatCurrency(formData.deliverables.reduce((acc, item) => acc + item.price, 0))}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabContainer>

                            <TabContainer value="details">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="uppercase text-xs font-semibold text-muted-foreground ml-1">Descrição Detalhada</Label>
                                        <DebouncedTextarea
                                            value={formData.description}
                                            onChange={(e: any) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Descreva o conceito criativo..."
                                            className="min-h-[120px] bg-background border-input focus-visible:ring-primary/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="uppercase text-xs font-semibold text-muted-foreground ml-1">Como Fazer?</Label>
                                            <DebouncedTextarea
                                                value={formData.howToDo}
                                                onChange={(e: any) => setFormData(prev => ({ ...prev, howToDo: e.target.value }))}
                                                className="bg-background border-input"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase text-xs font-semibold text-muted-foreground ml-1">Por Que Fazer?</Label>
                                            <DebouncedTextarea
                                                value={formData.whyToDo}
                                                onChange={(e: any) => setFormData(prev => ({ ...prev, whyToDo: e.target.value }))}
                                                className="bg-background border-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabContainer>

                            <TabContainer value="timeline">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <Label className="uppercase text-xs font-semibold text-muted-foreground ml-1">Início</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className={cn("w-full h-12 justify-start text-left font-normal bg-background border-input", !formData.startDate && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                                        {formData.startDate ? format(new Date(formData.startDate), "PPP", { locale: ptBR }) : <span>Selecione data...</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={formData.startDate ? new Date(formData.startDate) : undefined}
                                                        onSelect={(d) => setFormData(prev => ({ ...prev, startDate: d ? d.toISOString().split('T')[0] : '' }))}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="uppercase text-xs font-semibold text-muted-foreground ml-1">Fim</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className={cn("w-full h-12 justify-start text-left font-normal bg-background border-input", !formData.endDate && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                                        {formData.endDate ? format(new Date(formData.endDate), "PPP", { locale: ptBR }) : <span>Selecione data...</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={formData.endDate ? new Date(formData.endDate) : undefined}
                                                        onSelect={(d) => setFormData(prev => ({ ...prev, endDate: d ? d.toISOString().split('T')[0] : '' }))}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    {/* Visual Duration Bar */}
                                    {formData.startDate && formData.endDate && (
                                        <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                                <Clock className="w-6 h-6 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-accent">Duração da Campanha</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} dias de ativação
                                                </p>
                                            </div>
                                            <div className="ml-auto text-2xl font-bold opacity-20">2026</div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="uppercase text-xs font-semibold text-muted-foreground ml-1">Status Atual</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(v: any) => setFormData(prev => ({ ...prev, status: v }))}
                                        >
                                            <SelectTrigger className="h-12 bg-background border-input">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="planned">📋 Planejado</SelectItem>
                                                <SelectItem value="in_progress">🚀 Em Andamento</SelectItem>
                                                <SelectItem value="completed">✅ Concluído</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabContainer>

                            <TabContainer value="financial">
                                <div className="grid gap-6">
                                    {/* Summary Card */}
                                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gradient-premium text-white shadow-premium">
                                        <div className="space-y-1">
                                            <p className="text-blue-100 text-xs uppercase tracking-wider">Orçamento Total</p>
                                            <p className="text-3xl font-bold tracking-tight">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.budget)}
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-blue-100 text-xs uppercase tracking-wider">Verba de Mídia (Liq)</p>
                                            <p className="text-xl font-semibold opacity-90">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.mediaBudget)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <Label className="uppercase text-xs font-semibold text-muted-foreground ml-1">Budget Total</Label>
                                            <CurrencyInput
                                                value={formData.budget}
                                                onChange={v => setFormData(prev => ({ ...prev, budget: v }))}
                                                className="bg-background border-input"
                                            />
                                        </div>
                                        <div className="space-y-1.5 relative">
                                            <Label className="uppercase text-xs font-semibold text-muted-foreground ml-1">Fee Agência (%)</Label>
                                            <GlassInput
                                                type="number"
                                                value={formData.agencyFeePercentage}
                                                onChange={e => setFormData(prev => ({ ...prev, agencyFeePercentage: Number(e.target.value) }))}
                                                rightIcon={<span className="text-xs text-muted-foreground">%</span>}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <Label className="uppercase text-xs font-semibold text-muted-foreground ml-1">Impostos (%)</Label>
                                            <GlassInput
                                                type="number"
                                                value={formData.taxRate}
                                                onChange={e => setFormData(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                                                placeholder="6%"
                                                rightIcon={<span className="text-xs text-muted-foreground">%</span>}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-200 text-sm flex gap-3">
                                        <AlertTriangle className="w-5 h-5 shrink-0 text-orange-500" />
                                        <p>Lembre-se: O valor de <strong>Mídia Líquida</strong> é calculado automaticamente subtraindo o Fee da Agência e os Impostos do Budget Total.</p>
                                    </div>
                                </div>
                            </TabContainer>
                        </AnimatePresence>
                    </div>
                </Tabs>

                <DialogFooter className="p-6 pt-4 border-t border-border bg-background sticky bottom-0 z-10 flex flex-row justify-between items-center sm:justify-between w-full">
                    <Button variant="ghost" onClick={onClose} className="hover:bg-muted">
                        Cancelar
                    </Button>
                    <div className="flex gap-2">
                        {activeTab !== 'financial' && (
                            <Button variant="outline" onClick={() => {
                                const tabs = ['general', 'details', 'timeline', 'financial'];
                                const idx = tabs.indexOf(activeTab);
                                if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
                            }}>
                                Próximo
                            </Button>
                        )}
                        <Button onClick={handleSubmit} className="bg-gradient-hero text-white shadow-glow hover:brightness-110 border-0">
                            {editingStrategy ? 'Salvar Alterações' : 'Criar Estratégia'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
