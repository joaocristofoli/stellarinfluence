import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarketingStrategy, ChannelType, channelTypeLabels, channelTypeIcons } from '@/types/marketing';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import {
    Calendar,
    DollarSign,
    User,
    FileText,
    Trash2,
    Copy,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

interface StrategyDrawerProps {
    strategy: MarketingStrategy | null;
    open: boolean;
    onClose: () => void;
    onSave: (strategy: Partial<MarketingStrategy>) => void;
    onDelete?: (id: string) => void;
}

// Cores por tipo de canal
const channelColors: Record<ChannelType, string> = {
    influencer: 'bg-pink-500',
    paid_traffic: 'bg-blue-500',
    flyers: 'bg-green-500',
    physical_media: 'bg-orange-500',
    events: 'bg-violet-500',
    partnerships: 'bg-yellow-500',
    social_media: 'bg-cyan-500',
    email_marketing: 'bg-indigo-500',
    radio: 'bg-red-500',
    sound_car: 'bg-amber-500',
    promoters: 'bg-teal-500',
};

const statusConfig = {
    planned: { label: 'Planejado', variant: 'secondary' as const, icon: Clock },
    in_progress: { label: 'Em Andamento', variant: 'default' as const, icon: AlertCircle },
    completed: { label: 'Concluído', variant: 'outline' as const, icon: CheckCircle },
};

export function StrategyDrawer({ strategy, open, onClose, onSave, onDelete }: StrategyDrawerProps) {
    const [formData, setFormData] = useState<Partial<MarketingStrategy>>({});
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (strategy) {
            setFormData({
                name: strategy.name,
                channelType: strategy.channelType,
                budget: strategy.budget,
                responsible: strategy.responsible,
                description: strategy.description,
                howToDo: strategy.howToDo,
                whenToDo: strategy.whenToDo,
                whyToDo: strategy.whyToDo,
                status: strategy.status,
                startDate: strategy.startDate,
                endDate: strategy.endDate,
            });
        }
    }, [strategy]);

    const handleSave = () => {
        if (strategy) {
            onSave({ ...formData, id: strategy.id });
        }
        onClose();
    };

    const StatusIcon = strategy?.status ? statusConfig[strategy.status as keyof typeof statusConfig]?.icon : Clock;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-[440px] sm:w-[540px] overflow-hidden flex flex-col p-0">
                {/* Header */}
                <SheetHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "w-3 h-3 rounded-full",
                            strategy?.channelType && channelColors[strategy.channelType]
                        )} />
                        <SheetTitle className="text-lg font-semibold">
                            {strategy?.name || 'Nova Estratégia'}
                        </SheetTitle>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        {strategy?.status && (
                            <Badge variant={statusConfig[strategy.status as keyof typeof statusConfig]?.variant}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig[strategy.status as keyof typeof statusConfig]?.label}
                            </Badge>
                        )}
                        {strategy?.budget && (
                            <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                                <DollarSign className="w-3 h-3 mr-1" />
                                {formatCurrency(strategy.budget)}
                            </Badge>
                        )}
                    </div>
                </SheetHeader>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="w-full justify-start px-6 pt-2 bg-transparent border-b border-gray-100">
                        <TabsTrigger value="details" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                            <FileText className="w-4 h-4 mr-2" /> Detalhes
                        </TabsTrigger>
                        <TabsTrigger value="planning" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                            <Calendar className="w-4 h-4 mr-2" /> Planejamento
                        </TabsTrigger>
                    </TabsList>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        <TabsContent value="details" className="p-6 space-y-5 mt-0">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome da Ação</Label>
                                <Input
                                    id="name"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Campanha de Natal"
                                    className="h-10"
                                />
                            </div>

                            {/* Channel Type */}
                            <div className="space-y-2">
                                <Label>Tipo de Canal</Label>
                                <Select
                                    value={formData.channelType}
                                    onValueChange={(value) => setFormData({ ...formData, channelType: value as ChannelType })}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Selecione o canal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(channelTypeLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                <span className="flex items-center gap-2">
                                                    {channelTypeIcons[value as ChannelType]} {label}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Budget & Responsible - Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Orçamento</Label>
                                    <CurrencyInput
                                        id="budget"
                                        value={formData.budget || 0}
                                        onChange={(value) => setFormData({ ...formData, budget: value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="responsible">Responsável</Label>
                                    <Input
                                        id="responsible"
                                        value={formData.responsible || ''}
                                        onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                                        placeholder="Nome"
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descreva a ação..."
                                    className="min-h-[100px] resize-none"
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planned">
                                            <span className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" /> Planejado
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="in_progress">
                                            <span className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" /> Em Andamento
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            <span className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Concluído
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </TabsContent>

                        <TabsContent value="planning" className="p-6 space-y-5 mt-0">
                            {/* How to do */}
                            <div className="space-y-2">
                                <Label htmlFor="howToDo">Como Fazer</Label>
                                <Textarea
                                    id="howToDo"
                                    value={formData.howToDo || ''}
                                    onChange={(e) => setFormData({ ...formData, howToDo: e.target.value })}
                                    placeholder="Descreva o processo..."
                                    className="min-h-[80px] resize-none"
                                />
                            </div>

                            {/* When to do */}
                            <div className="space-y-2">
                                <Label htmlFor="whenToDo">Quando Fazer</Label>
                                <Textarea
                                    id="whenToDo"
                                    value={formData.whenToDo || ''}
                                    onChange={(e) => setFormData({ ...formData, whenToDo: e.target.value })}
                                    placeholder="Defina o cronograma..."
                                    className="min-h-[80px] resize-none"
                                />
                            </div>

                            {/* Why to do */}
                            <div className="space-y-2">
                                <Label htmlFor="whyToDo">Por que Fazer</Label>
                                <Textarea
                                    id="whyToDo"
                                    value={formData.whyToDo || ''}
                                    onChange={(e) => setFormData({ ...formData, whyToDo: e.target.value })}
                                    placeholder="Justifique a ação..."
                                    className="min-h-[80px] resize-none"
                                />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                {/* Footer Actions */}
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {onDelete && strategy && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => onDelete(strategy.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="sm">
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                Salvar
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
