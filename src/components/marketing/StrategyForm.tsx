import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useCreators } from '@/hooks/useCreators';
import { Creator } from '@/types/creator';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { GlassInput } from '@/components/ui/glass-input';
import { motion, AnimatePresence } from "framer-motion";
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
    });

    const [activeTab, setActiveTab] = useState("general");

    // Phase 3: Financial Calculation Logic
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

    const { toast } = useToast();
    const [aiLoading, setAiLoading] = useState(false);
    const [showAiDialog, setShowAiDialog] = useState(false);
    const { data: creators = [], isLoading: loadingCreators } = useCreators(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleCreatorSelect = (creatorId: string) => {
        const creator = creators.find(c => c.id === creatorId);
        if (!creator) return;

        if (formData.linkedCreatorIds.includes(creatorId)) {
            toast({
                title: "Já vinculado",
                description: `${creator.name} já está vinculado.`,
                variant: "destructive",
            });
            return;
        }

        const newLinkedIds = [...formData.linkedCreatorIds, creatorId];
        const linkedCreators = newLinkedIds.map(id => creators.find(c => c.id === id)).filter(Boolean) as Creator[];
        const creatorNames = linkedCreators.map(c => c.name).join(' + ');
        const categories = [...new Set(linkedCreators.map(c => c.category))].join(', ');

        setFormData(prev => ({
            ...prev,
            linkedCreatorIds: newLinkedIds,
            name: linkedCreators.length === 1 ? `Parceria: ${creator.name}` : `Parceria: ${creatorNames}`,
            responsible: linkedCreators.map(c => c.name).join(', '),
            description: `Parceria com ${linkedCreators.length} influenciador(es) do nicho ${categories}.\n\nPerfis:\n${linkedCreators.map(c => `• ${c.name}: ${c.instagram_url || c.youtube_url || 'N/A'}`).join('\n')}`,
            channelType: 'influencer'
        }));
    };

    const handleCreatorRemove = (creatorId: string) => {
        setFormData(prev => ({
            ...prev,
            linkedCreatorIds: prev.linkedCreatorIds.filter(id => id !== creatorId)
        }));
    };

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
                linkedCreatorIds: [],
                agencyFeePercentage: 0,
                taxRate: 6,
                mediaBudget: 0,
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
            creator_snapshots: creatorSnapshots
        });
        onClose();
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

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border-white/10 overflow-hidden">
                <DialogHeader className="p-6 pb-2 border-b border-white/5">
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
                                    className="h-8 text-xs border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10"
                                >
                                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1 text-purple-400" />}
                                    IA Magic
                                </Button>
                            )}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <div className="px-6 pt-4 border-b border-white/5">
                        <TabsList className="bg-muted/30 p-1 border border-white/5 w-full justify-start h-auto">
                            <TabsTrigger value="general" className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur px-4 py-2">
                                <LayoutGrid className="w-4 h-4 mr-2" /> Geral
                            </TabsTrigger>
                            <TabsTrigger value="details" className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur px-4 py-2">
                                <AlignLeft className="w-4 h-4 mr-2" /> Detalhes
                            </TabsTrigger>
                            <TabsTrigger value="timeline" className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur px-4 py-2">
                                <Clock className="w-4 h-4 mr-2" /> Cronograma
                            </TabsTrigger>
                            <TabsTrigger value="financial" className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur px-4 py-2">
                                <DollarSign className="w-4 h-4 mr-2" /> Financeiro
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                        <AnimatePresence mode="wait">
                            <TabContainer value="general">
                                <div className="grid grid-cols-2 gap-6">
                                    <GlassInput
                                        label="Nome da Ação"
                                        value={formData.name}
                                        onChange={e => {
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
                                            <SelectTrigger className="h-12 bg-white/5 border-white/10 backdrop-blur-md">
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

                                <GlassInput
                                    label="Responsável"
                                    value={formData.responsible}
                                    onChange={e => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                                    icon={<Users className="w-4 h-4" />}
                                />

                                {campaigns.length > 0 && (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Campanha (Pai)</Label>
                                        <Select
                                            value={formData.campaignId || 'none'}
                                            onValueChange={(v) => setFormData(prev => ({ ...prev, campaignId: v === 'none' ? null : v }))}
                                        >
                                            <SelectTrigger className="h-12 bg-white/5 border-white/10 backdrop-blur-md">
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

                                {/* Creator Linking Section */}
                                <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-2 text-primary">
                                            <Users className="w-4 h-4 text-accent" />
                                            {formData.channelType === 'influencer' ? 'Influenciadores Vinculados' : 'Parceiros'}
                                        </Label>
                                        <span className="text-xs text-muted-foreground">{formData.linkedCreatorIds.length} selecionados</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                                        {formData.linkedCreatorIds.map(id => {
                                            const c = creators.find(cr => cr.id === id);
                                            return (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    key={id}
                                                    className="pl-3 pr-1 py-1 rounded-full bg-accent/20 border border-accent/20 text-xs font-medium flex items-center gap-2 text-accent-foreground"
                                                >
                                                    {c?.name}
                                                    <button onClick={() => handleCreatorRemove(id)} className="p-1 hover:bg-black/20 rounded-full">×</button>
                                                </motion.div>
                                            )
                                        })}
                                        {formData.linkedCreatorIds.length === 0 && (
                                            <p className="text-sm text-muted-foreground italic py-2">Nenhum parceiro selecionado.</p>
                                        )}
                                    </div>

                                    <Select onValueChange={handleCreatorSelect}>
                                        <SelectTrigger className="bg-transparent border-white/10 hover:bg-white/5">
                                            <SelectValue placeholder="Adicionar parceiro..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {creators.map(c => (
                                                <SelectItem key={c.id} value={c.id} disabled={formData.linkedCreatorIds.includes(c.id)}>
                                                    {c.name} ({c.category})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabContainer>

                            <TabContainer value="details">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="uppercase text-xs font-semibold text-muted-foreground ml-1">Descrição Detalhada</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Descreva o conceito criativo..."
                                            className="min-h-[120px] bg-white/5 border-white/10 backdrop-blur-md focus-visible:ring-accent/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="uppercase text-xs font-semibold text-muted-foreground ml-1">Como Fazer?</Label>
                                            <Textarea
                                                value={formData.howToDo}
                                                onChange={e => setFormData(prev => ({ ...prev, howToDo: e.target.value }))}
                                                className="bg-white/5 border-white/10 backdrop-blur-md"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase text-xs font-semibold text-muted-foreground ml-1">Por Que Fazer?</Label>
                                            <Textarea
                                                value={formData.whyToDo}
                                                onChange={e => setFormData(prev => ({ ...prev, whyToDo: e.target.value }))}
                                                className="bg-white/5 border-white/10 backdrop-blur-md"
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
                                                    <Button variant="outline" className={cn("w-full h-12 justify-start text-left font-normal bg-white/5 border-white/10", !formData.startDate && "text-muted-foreground")}>
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
                                                    <Button variant="outline" className={cn("w-full h-12 justify-start text-left font-normal bg-white/5 border-white/10", !formData.endDate && "text-muted-foreground")}>
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
                                            <SelectTrigger className="h-12 bg-white/5 border-white/10 backdrop-blur-md">
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
                                                className="bg-white/5 border-white/10"
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

                                    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm flex gap-3">
                                        <AlertTriangle className="w-5 h-5 shrink-0 text-orange-500" />
                                        <p>Lembre-se: O valor de <strong>Mídia Líquida</strong> é calculado automaticamente subtraindo o Fee da Agência e os Impostos do Budget Total.</p>
                                    </div>
                                </div>
                            </TabContainer>
                        </AnimatePresence>
                    </div>
                </Tabs>

                <DialogFooter className="p-6 pt-4 border-t border-white/5 bg-background/50 backdrop-blur-md sticky bottom-0 z-10 flex flex-row justify-between items-center sm:justify-between w-full">
                    <Button variant="ghost" onClick={onClose} className="hover:bg-white/5">
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
        </Dialog>
    );
}
