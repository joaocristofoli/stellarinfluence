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
                            <Label htmlFor="name">Nome da Estratégia</Label>
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
    );
}
