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
    ChannelType,
    channelTypeLabels,
    channelTypeIcons
} from '@/types/marketing';
import { generateMarketingIdeas, AIStrategySuggestion } from '@/utils/aiGenerator';
import { Sparkles, Loader2, Lightbulb, Link as LinkIcon, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Creator } from '@/types/creator';

interface StrategyFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (strategy: Omit<MarketingStrategy, 'id' | 'createdAt' | 'updatedAt'>) => void;
    editingStrategy?: MarketingStrategy | null;
    existingStrategies: MarketingStrategy[];
    companyId: string;
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
    });

    const { toast } = useToast();
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<AIStrategySuggestion[]>([]);
    const [showAiDialog, setShowAiDialog] = useState(false);

    // Creator Integration
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loadingCreators, setLoadingCreators] = useState(false);

    useEffect(() => {
        const fetchCreators = async () => {
            setLoadingCreators(true);
            const { data } = await supabase.from('creators').select('*');
            if (data) {
                // @ts-ignore - Supabase types mismatch with our strict Creator type but structure is compatible
                setCreators(data);
            }
            setLoadingCreators(false);
        };
        fetchCreators();
    }, []);

    const handleCreatorSelect = (creatorId: string) => {
        const creator = creators.find(c => c.id === creatorId);
        if (!creator) return;

        // Auto-fill fields based on creator data
        setFormData(prev => ({
            ...prev,
            name: `Parceria: ${creator.name}`,
            responsible: creator.name,
            budget: 0, // Could implement estimated cost logic here if data existed
            description: `Parceria com influenciador do nicho ${creator.category}. \nPerfil: ${createProfileLink(creator)}`,
            channelType: 'influencer'
        }));

        toast({
            title: "Influenciador Vinculado",
            description: `Dados de ${creator.name} foram preenchidos automaticamente.`,
        });
    };

    const createProfileLink = (creator: Creator) => {
        if (creator.instagram_url) return creator.instagram_url;
        if (creator.tiktok_url) return creator.tiktok_url;
        if (creator.youtube_url) return creator.youtube_url;
        return `https://stellar-influence.com/creator/${creator.slug}`;
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
            });
        }
    }, [editingStrategy, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            companyId,
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
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Campanha de Lançamento"
                                    required
                                />
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
                                </Label>
                                <Select onValueChange={handleCreatorSelect}>
                                    <SelectTrigger className="bg-white dark:bg-black/20">
                                        <SelectValue placeholder="Selecione um influenciador..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingCreators ? (
                                            <div className="p-2 text-center text-sm text-muted-foreground">Carregando...</div>
                                        ) : creators.length === 0 ? (
                                            <div className="p-2 text-center text-sm text-muted-foreground">Nenhum influenciador cadastrado</div>
                                        ) : (
                                            creators.map(creator => (
                                                <SelectItem key={creator.id} value={creator.id}>
                                                    {creator.name} ({creator.category})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Selecionar um influenciador preencherá automaticamente o nome, responsável e descrição.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="budget">Orçamento (R$)</Label>
                                <Input
                                    id="budget"
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={formData.budget}
                                    onChange={e => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                                    placeholder="0,00"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="responsible">Responsável</Label>
                                <Input
                                    id="responsible"
                                    value={formData.responsible}
                                    onChange={e => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                                    placeholder="Nome do responsável"
                                    required
                                />
                            </div>
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

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Descreva a estratégia..."
                                rows={2}
                                required
                            />
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
