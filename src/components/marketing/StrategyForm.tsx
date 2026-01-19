import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
    MarketingStrategy,
    MarketingCampaign,
    ChannelType,
    channelTypeLabels,
    channelTypeIcons
} from '@/types/marketing';
import { generateMarketingIdeas, AIStrategySuggestion } from '@/utils/aiGenerator';
import { Sparkles, Loader2, Lightbulb, Link as LinkIcon, Users, FolderKanban, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreators } from '@/hooks/useCreators';
import { Creator } from '@/types/creator';
import { CurrencyInput } from '@/components/ui/CurrencyInput';

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
        // Calendar fields
        startDate: '' as string,
        endDate: '' as string,
        linkedCreatorIds: [] as string[],
    });

    const { toast } = useToast();
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<AIStrategySuggestion[]>([]);
    const [showAiDialog, setShowAiDialog] = useState(false);

    // Creator Integration - usando hook centralizado
    // Enforcing approvedOnly=true for Marketing Strategy Planning
    const { data: creators = [], isLoading: loadingCreators } = useCreators(true);

    const handleCreatorSelect = (creatorId: string) => {
        const creator = creators.find(c => c.id === creatorId);
        if (!creator) return;

        // Verificar se já está vinculado
        if (formData.linkedCreatorIds.includes(creatorId)) {
            toast({
                title: "Já vinculado",
                description: `${creator.name} já está vinculado a esta estratégia.`,
                variant: "destructive",
            });
            return;
        }

        // Lista atualizada de criadores
        const newLinkedIds = [...formData.linkedCreatorIds, creatorId];
        const linkedCreators = newLinkedIds
            .map(id => creators.find(c => c.id === id))
            .filter(Boolean) as Creator[];

        // Gerar nome dinâmico com TODOS os influenciadores
        const creatorNames = linkedCreators.map(c => c.name).join(' + ');
        const categories = [...new Set(linkedCreators.map(c => c.category))].join(', ');

        setFormData(prev => ({
            ...prev,
            linkedCreatorIds: newLinkedIds,
            // CORREÇÃO: Nome atualizado com TODOS os influenciadores
            name: linkedCreators.length === 1
                ? `Parceria: ${creator.name}`
                : `Parceria: ${creatorNames}`,
            responsible: linkedCreators.map(c => c.name).join(', '),
            description: `Parceria com ${linkedCreators.length} influenciador(es) do nicho ${categories}.\n\nPerfis:\n${linkedCreators.map(c => `• ${c.name}: ${createProfileLink(c)}`).join('\n')}`,
            channelType: 'influencer'
        }));

        toast({
            title: "Influenciador Vinculado",
            description: `${creator.name} adicionado. Total: ${newLinkedIds.length} influenciador(es).`,
        });
    };

    // Função para remover influenciador vinculado
    const handleCreatorRemove = (creatorId: string) => {
        const creator = creators.find(c => c.id === creatorId);
        const newLinkedIds = formData.linkedCreatorIds.filter(id => id !== creatorId);
        const linkedCreators = newLinkedIds
            .map(id => creators.find(c => c.id === id))
            .filter(Boolean) as Creator[];

        // Recalcular nome e descrição com os restantes
        const creatorNames = linkedCreators.map(c => c.name).join(' + ');
        const categories = [...new Set(linkedCreators.map(c => c.category))].join(', ');

        setFormData(prev => ({
            ...prev,
            linkedCreatorIds: newLinkedIds,
            // Atualizar nome/descrição se ainda houver influenciadores
            name: linkedCreators.length === 0
                ? ''
                : linkedCreators.length === 1
                    ? `Parceria: ${linkedCreators[0].name}`
                    : `Parceria: ${creatorNames}`,
            responsible: linkedCreators.map(c => c.name).join(', '),
            description: linkedCreators.length === 0
                ? ''
                : `Parceria com ${linkedCreators.length} influenciador(es) do nicho ${categories}.\n\nPerfis:\n${linkedCreators.map(c => `• ${c.name}: ${createProfileLink(c)}`).join('\n')}`,
        }));

        toast({
            title: "Influenciador Removido",
            description: creator ? `${creator.name} foi desvinculado.` : "Influenciador removido.",
        });
    };

    const createProfileLink = (creator: Creator) => {
        if (creator.instagram_url) return creator.instagram_url;
        if (creator.tiktok_url) return creator.tiktok_url;
        if (creator.youtube_url) return creator.youtube_url;
        return `https://agenciaeternizar.com.br/creator/${creator.slug}`;
    };

    const handleGenerateAI = async () => {
        if (!formData.channelType) return;

        setAiLoading(true);
        try {
            // Need to fetch company name from parent context or props.
            // Since props only have companyId, we might need to assume or pass company name.
            // However, usually we have company context. 
            // For now, let's use a placeholder or ask user to input if empty?
            // Wait, we don't have company name here.
            // We should modify StrategyForm props to include companyName/Description
            // OR fetch it.
            // Let's assume passed in props for now, or just send generic "Empresa com ID..." (bad).
            // Better: update StrategyForm props signature in next step.
            // For THIS step, let's implement the logic assuming we have access or will fix it.
            // Actually, StrategyForm is used inside MarketingPlanner where `selectedCompany` is available.
            // I will update StrategyForm props too.
            const suggestions = await generateMarketingIdeas(
                "Sua Empresa", // Placeholder, will fix
                "Empresa local", // Placeholder
                formData.channelType,
                formData.budget > 0 ? formData.budget : undefined
            );
            setAiSuggestions(suggestions);
            setShowAiDialog(true);
        } catch (error) {
            toast({
                title: 'Erro na IA',
                description: 'Não foi possível gerar sugestões. Verifique a chave de API.',
                variant: 'destructive',
            });
        } finally {
            setAiLoading(false);
        }
    };

    const applySuggestion = (suggestion: AIStrategySuggestion) => {
        setFormData(prev => ({
            ...prev,
            name: suggestion.title,
            description: suggestion.description,
            howToDo: suggestion.howToDo,
            whenToDo: suggestion.whenToDo,
            whyToDo: suggestion.whyToDo,
            budget: suggestion.suggestedBudget,
        }));
        setShowAiDialog(false);
        toast({
            title: 'Ideia aplicada!',
            description: 'Os campos foram preenchidos com a sugestão da IA.',
        });
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
                startDate: editingStrategy.startDate
                    ? new Date(editingStrategy.startDate).toISOString().split('T')[0]
                    : '',
                endDate: editingStrategy.endDate
                    ? new Date(editingStrategy.endDate).toISOString().split('T')[0]
                    : '',
                linkedCreatorIds: editingStrategy.linkedCreatorIds || [],
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
            });
        }
    }, [editingStrategy, open, defaultCampaignId, defaultDate]);

    // Estado para erros de validação - CRIT-003 fix
    const [errors, setErrors] = useState<Record<string, string>>({});

    /**
     * Valida os campos obrigatórios do formulário.
     * @returns true se válido, false se houver erros
     */
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome da ação é obrigatório';
        }

        if (!formData.responsible.trim()) {
            newErrors.responsible = 'Responsável é obrigatório';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Descrição é obrigatória';
        }

        // CLEAN-001: startDate é obrigatório para aparecer no calendário
        if (!formData.startDate) {
            newErrors.startDate = 'Data de início é obrigatória para aparecer no calendário';
        }

        // Validar datas se ambas preenchidas
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end < start) {
                newErrors.endDate = 'Data de fim não pode ser anterior à data de início';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Helper para limpar erros ao digitar
    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validar antes de enviar - CRIT-003 fix
        if (!validateForm()) {
            toast({
                title: 'Campos obrigatórios',
                description: 'Por favor, corrija os erros destacados em vermelho.',
                variant: 'destructive',
            });
            return;
        }

        const creatorSnapshots = formData.channelType === 'influencer' && formData.linkedCreatorIds.length > 0
            ? formData.linkedCreatorIds.reduce((acc, id) => {
                const creator = creators.find(c => c.id === id);
                if (creator) {
                    acc[id] = {
                        captured_at: new Date().toISOString(),
                        ...creator
                    };
                }
                return acc;
            }, {} as Record<string, any>)
            : {};

        onSave({
            ...formData,
            companyId,
            startDate: formData.startDate ? new Date(formData.startDate) : null,
            endDate: formData.endDate ? new Date(formData.endDate) : null,
            // @ts-ignore - Adding creator_snapshots to payload for Premium Agency Pricing Rule
            creator_snapshots: creatorSnapshots
        });
        onClose();
    };

    const handleConnectionToggle = (strategyId: string) => {
        setFormData(prev => ({
            ...prev,
            connections: prev.connections.includes(strategyId)
                ? prev.connections.filter(id => id !== strategyId)
                : [...prev.connections, strategyId],
        }));
    };

    const otherStrategies = existingStrategies.filter(
        s => s.id !== editingStrategy?.id
    );

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-display text-xl">
                            {editingStrategy ? 'Editar Estratégia' : 'Nova Estratégia de Marketing'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="name">Nome da Estratégia</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                        onClick={handleGenerateAI}
                                        disabled={aiLoading}
                                    >
                                        {aiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                        {aiLoading ? 'Criando...' : 'Mágica com IA'}
                                    </Button>
                                </div>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => {
                                        setFormData(prev => ({ ...prev, name: e.target.value }));
                                        clearError('name');
                                    }}
                                    placeholder="Ex: Campanha de Lançamento"
                                    className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="channelType">Tipo de Canal</Label>
                                <Select
                                    value={formData.channelType}
                                    onValueChange={(value: ChannelType) =>
                                        setFormData(prev => ({ ...prev, channelType: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {channelTypes.map(type => (
                                            <SelectItem key={type} value={type}>
                                                {channelTypeIcons[type]} {channelTypeLabels[type]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Creator Selector - Only shows if 'influencer' is selected */}
                        {formData.channelType === 'influencer' && (
                            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg border border-purple-100 dark:border-purple-800 mb-4">
                                <Label className="text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4" />
                                    Vincular Influenciador do Banco de Talentos
                                    {formData.linkedCreatorIds.length > 0 && (
                                        <span className="ml-auto text-xs bg-purple-200 dark:bg-purple-800 px-2 py-0.5 rounded-full">
                                            {formData.linkedCreatorIds.length} vinculado(s)
                                        </span>
                                    )}
                                </Label>

                                {/* TASK-002: Chips dos influenciadores vinculados */}
                                {formData.linkedCreatorIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.linkedCreatorIds.map(creatorId => {
                                            const creator = creators.find(c => c.id === creatorId);
                                            return (
                                                <div
                                                    key={creatorId}
                                                    className="flex items-center gap-1 px-2 py-1 bg-purple-200 dark:bg-purple-800 rounded-full text-sm"
                                                >
                                                    <span className="text-purple-800 dark:text-purple-200">
                                                        {creator?.name || 'Desconhecido'}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCreatorRemove(creatorId)}
                                                        className="ml-1 w-4 h-4 rounded-full bg-purple-400 dark:bg-purple-600 hover:bg-red-500 text-white flex items-center justify-center text-xs transition-colors"
                                                        title={`Remover ${creator?.name}`}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <Select onValueChange={handleCreatorSelect}>
                                    <SelectTrigger className="bg-white dark:bg-black/20">
                                        <SelectValue placeholder={
                                            formData.linkedCreatorIds.length > 0
                                                ? "Adicionar mais influenciadores..."
                                                : "Selecione um influenciador..."
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingCreators ? (
                                            <div className="p-2 text-center text-sm text-muted-foreground">Carregando...</div>
                                        ) : creators.length === 0 ? (
                                            <div className="p-2 text-center text-sm text-muted-foreground">Nenhum influenciador cadastrado</div>
                                        ) : (
                                            creators.map(creator => {
                                                const isAlreadyLinked = formData.linkedCreatorIds.includes(creator.id);
                                                return (
                                                    <SelectItem
                                                        key={creator.id}
                                                        value={creator.id}
                                                        disabled={isAlreadyLinked}
                                                        className={isAlreadyLinked ? 'opacity-50' : ''}
                                                    >
                                                        {creator.name} ({creator.category})
                                                        {isAlreadyLinked && ' ✓'}
                                                    </SelectItem>
                                                );
                                            })
                                        )}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {formData.linkedCreatorIds.length === 0
                                        ? "Selecionar um influenciador preencherá automaticamente o nome, responsável e descrição."
                                        : "Você pode vincular múltiplos influenciadores. Clique no × para remover."}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="budget">Orçamento (R$)</Label>
                                <CurrencyInput
                                    id="budget"
                                    value={formData.budget}
                                    onChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
                                    placeholder="R$ 0,00"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="responsible">Responsável</Label>
                                <Input
                                    id="responsible"
                                    value={formData.responsible}
                                    onChange={e => {
                                        setFormData(prev => ({ ...prev, responsible: e.target.value }));
                                        clearError('responsible');
                                    }}
                                    placeholder="Nome do responsável"
                                    className={errors.responsible ? "border-red-500 focus-visible:ring-red-500" : ""}
                                />
                                {errors.responsible && <p className="text-xs text-red-500 mt-1 font-medium">{errors.responsible}</p>}
                            </div>
                        </div>

                        {/* Calendar Dates Section */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <Label className="text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-3">
                                <Calendar className="w-4 h-4" />
                                Datas do Calendário
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="text-sm">Data de Início</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={e => {
                                            setFormData(prev => ({ ...prev, startDate: e.target.value }));
                                            clearError('startDate');
                                        }}
                                        className={`bg-white dark:bg-black/20 ${errors.startDate ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    />
                                    {errors.startDate && <p className="text-xs text-red-500 mt-1 font-medium">{errors.startDate}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate" className="text-sm">Data de Fim</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={e => {
                                            setFormData(prev => ({ ...prev, endDate: e.target.value }));
                                            clearError('endDate');
                                        }}
                                        className={`bg-white dark:bg-black/20 ${errors.endDate ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    />
                                    {errors.endDate && <p className="text-xs text-red-500 mt-1 font-medium">{errors.endDate}</p>}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Defina as datas para visualizar esta estratégia no calendário de campanhas.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: 'planned' | 'in_progress' | 'completed') =>
                                    setFormData(prev => ({ ...prev, status: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planned">📋 Planejado</SelectItem>
                                    <SelectItem value="in_progress">🚀 Em Andamento</SelectItem>
                                    <SelectItem value="completed">✅ Concluído</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {campaigns.length > 0 && (
                            <div className="space-y-2 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800">
                                <Label className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                    <FolderKanban className="w-4 h-4" />
                                    Vincular a Campanha
                                </Label>
                                <Select
                                    value={formData.campaignId || 'none'}
                                    onValueChange={(value) =>
                                        setFormData(prev => ({ ...prev, campaignId: value === 'none' ? null : value }))
                                    }
                                >
                                    <SelectTrigger className="bg-white dark:bg-black/20">
                                        <SelectValue placeholder="Selecione uma campanha..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">📂 Sem Campanha</SelectItem>
                                        {campaigns.map(campaign => (
                                            <SelectItem key={campaign.id} value={campaign.id}>
                                                {campaign.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={e => {
                                    setFormData(prev => ({ ...prev, description: e.target.value }));
                                    clearError('description');
                                }}
                                placeholder="Descreva a estratégia..."
                                rows={2}
                                className={errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
                            />
                            {errors.description && <p className="text-xs text-red-500 mt-1 font-medium">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="howToDo">Como fazer?</Label>
                            <Textarea
                                id="howToDo"
                                value={formData.howToDo}
                                onChange={e => setFormData(prev => ({ ...prev, howToDo: e.target.value }))}
                                placeholder="Descreva o passo a passo..."
                                rows={2}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whenToDo">Quando fazer?</Label>
                            <Textarea
                                id="whenToDo"
                                value={formData.whenToDo}
                                onChange={e => setFormData(prev => ({ ...prev, whenToDo: e.target.value }))}
                                placeholder="Cronograma, datas, frequência..."
                                rows={2}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whyToDo">Por que fazer?</Label>
                            <Textarea
                                id="whyToDo"
                                value={formData.whyToDo}
                                onChange={e => setFormData(prev => ({ ...prev, whyToDo: e.target.value }))}
                                placeholder="Justificativa e objetivos..."
                                rows={2}
                                required
                            />
                        </div>

                        {otherStrategies.length > 0 && (
                            <div className="space-y-3">
                                <Label>Conecta com outras estratégias</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-muted/50 rounded-lg">
                                    {otherStrategies.map(strategy => (
                                        <div key={strategy.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`connection-${strategy.id}`}
                                                checked={formData.connections.includes(strategy.id)}
                                                onCheckedChange={() => handleConnectionToggle(strategy.id)}
                                            />
                                            <label
                                                htmlFor={`connection-${strategy.id}`}
                                                className="text-sm text-muted-foreground cursor-pointer"
                                            >
                                                {channelTypeIcons[strategy.channelType]} {strategy.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="gradient-primary">
                                {editingStrategy ? 'Salvar Alterações' : 'Criar Estratégia'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            Sugestões da IA para {channelTypeLabels[formData.channelType]}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4 mt-4">
                        {aiSuggestions.map((suggestion, index) => (
                            <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer group relative" onClick={() => applySuggestion(suggestion)}>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm">Usar esta</Button>
                                </div>
                                <h3 className="font-semibold text-lg text-primary mb-2 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" />
                                    {suggestion.title}
                                </h3>
                                <p className="text-sm text-foreground/80 mb-2">{suggestion.description}</p>
                                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mt-3 bg-muted/30 p-2 rounded">
                                    <div><strong>Orçamento:</strong> R$ {suggestion.suggestedBudget}</div>
                                    <div><strong>Quando:</strong> {suggestion.whenToDo}</div>
                                    <div><strong>Por que:</strong> {suggestion.whyToDo}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
