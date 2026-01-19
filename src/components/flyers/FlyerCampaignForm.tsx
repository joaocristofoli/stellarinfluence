import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { FlyerCampaign } from '@/types/flyer';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Palette } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FlyerCampaignFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (campaign: Omit<FlyerCampaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onDelete?: () => void;
    editingCampaign?: FlyerCampaign | null;
    companyId: string;
}

const COLOR_PRESETS = [
    { name: 'Roxo (Aiqfome)', color: '#8b5cf6' },
    { name: 'Verde', color: '#10b981' },
    { name: 'Azul', color: '#3b82f6' },
    { name: 'Laranja', color: '#f59e0b' },
    { name: 'Rosa', color: '#ec4899' },
    { name: 'Vermelho', color: '#ef4444' },
    { name: 'Ciano', color: '#06b6d4' },
    { name: 'Índigo', color: '#6366f1' },
];

export function FlyerCampaignForm({
    open,
    onClose,
    onSave,
    onDelete,
    editingCampaign,
    companyId,
}: FlyerCampaignFormProps) {
    const [formData, setFormData] = useState(() => {
        // Restore from localStorage if creating new
        if (!editingCampaign) {
            const saved = localStorage.getItem('flyerCampaignDraft');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Ensure dates are parsed back if needed, but strings are fine for initial state
                    return parsed;
                } catch (e) {
                    console.error('Error parsing draft campaign:', e);
                }
            }
        }

        return {
            name: '',
            description: '',
            color: '#8b5cf6', // Roxo default (Aiqfome)
            startDate: '',
            endDate: '',
            totalBudget: 0,
        };
    });

    const [startDate, setStartDate] = useState<Date | undefined>(() => {
        // Restore start date from draft if available
        if (!editingCampaign) {
            const saved = localStorage.getItem('flyerCampaignDraft');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.startDate) return new Date(parsed.startDate);
                } catch { }
            }
        }
        return undefined;
    });

    const [endDate, setEndDate] = useState<Date | undefined>(() => {
        // Restore end date from draft if available
        if (!editingCampaign) {
            const saved = localStorage.getItem('flyerCampaignDraft');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.endDate) return new Date(parsed.endDate);
                } catch { }
            }
        }
        return undefined;
    });

    const { toast } = useToast(); // Assuming useToast is available in component scope or imported

    useEffect(() => {
        if (editingCampaign) {
            setFormData({
                name: editingCampaign.name,
                description: editingCampaign.description || '',
                color: editingCampaign.color,
                startDate: editingCampaign.startDate,
                endDate: editingCampaign.endDate,
                totalBudget: editingCampaign.totalBudget,
            });
            setStartDate(new Date(editingCampaign.startDate));
            setEndDate(new Date(editingCampaign.endDate));
        }
        // If creating new, we rely on the state initializer for localStorage restoration
    }, [editingCampaign, open]);

    // Auto-save draft
    useEffect(() => {
        if (!editingCampaign && open) {
            localStorage.setItem('flyerCampaignDraft', JSON.stringify({
                ...formData,
                startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
                endDate: endDate ? format(endDate, 'yyyy-MM-dd') : ''
            }));
        }
    }, [formData, startDate, endDate, editingCampaign, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            toast({
                title: 'Datas obrigatórias',
                description: 'Por favor, selecione as datas de início e fim da campanha.',
                variant: 'destructive',
            });
            return;
        }

        if (endDate < startDate) {
            toast({
                title: 'Data inválida',
                description: 'A data de fim não pode ser anterior à data de início.',
                variant: 'destructive',
            });
            return;
        }

        onSave({
            companyId,
            name: formData.name,
            description: formData.description || undefined,
            color: formData.color,
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            totalBudget: formData.totalBudget,
        });

        // Clear draft after successful save
        if (!editingCampaign) {
            localStorage.removeItem('flyerCampaignDraft');
            setFormData({
                name: '',
                description: '',
                color: '#8b5cf6',
                startDate: '',
                endDate: '',
                totalBudget: 0,
            });
            setStartDate(undefined);
            setEndDate(undefined);
        }

        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl flex items-center gap-2">
                        <Palette className="w-5 h-5" style={{ color: formData.color }} />
                        {editingCampaign ? 'Editar Campanha de Panfletagem' : 'Nova Campanha de Panfletagem'}
                    </DialogTitle>
                    <DialogDescription>
                        {editingCampaign
                            ? 'Atualize as informações da campanha.'
                            : 'Crie uma nova campanha para organizar seus eventos de distribuição.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nome */}
                    <div className="space-y-2">
                        <Label htmlFor="campaign-name">Nome da Campanha *</Label>
                        <Input
                            id="campaign-name"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Aiqfome - Lançamento Toledo"
                            required
                        />
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <Label htmlFor="campaign-description">Descrição</Label>
                        <Textarea
                            id="campaign-description"
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Descreva brevemente a campanha..."
                            rows={2}
                        />
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-2">
                        <Label>Cor da Campanha *</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {COLOR_PRESETS.map(preset => (
                                <button
                                    key={preset.color}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, color: preset.color }))}
                                    className={cn(
                                        'p-3 rounded-lg border-2 transition-all hover:scale-105',
                                        formData.color === preset.color
                                            ? 'border-black dark:border-white ring-2 ring-offset-2'
                                            : 'border-transparent'
                                    )}
                                    style={{
                                        backgroundColor: preset.color + '20',
                                        borderColor: formData.color === preset.color ? preset.color : undefined,
                                    }}
                                >
                                    <div
                                        className="w-full h-8 rounded-md"
                                        style={{ backgroundColor: preset.color }}
                                    />
                                    <p className="text-xs mt-1 text-center font-medium">{preset.name}</p>
                                </button>
                            ))}
                        </div>

                        {/* Custom Color */}
                        <div className="flex items-center gap-2 pt-2">
                            <Label htmlFor="custom-color">Cor personalizada:</Label>
                            <input
                                id="custom-color"
                                type="color"
                                value={formData.color}
                                onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                className="w-20 h-10 rounded cursor-pointer"
                            />
                            <span className="text-sm text-muted-foreground font-mono">{formData.color}</span>
                        </div>
                    </div>

                    {/* Datas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Data de Início *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !startDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Data de Fim *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !endDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        initialFocus
                                        locale={ptBR}
                                        disabled={(date) => startDate ? date < startDate : false}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Orçamento Total */}
                    <div className="space-y-2">
                        <Label htmlFor="total-budget">Orçamento Total Planejado</Label>
                        <CurrencyInput
                            id="total-budget"
                            value={formData.totalBudget}
                            onChange={(value) => setFormData(prev => ({ ...prev, totalBudget: value }))}
                            placeholder="0,00"
                        />
                        <p className="text-xs text-muted-foreground">
                            Opcional: defina um orçamento total planejado para a campanha
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between gap-3 pt-4 border-t border-border">
                        <div>
                            {editingCampaign && onDelete && (
                                <Button type="button" variant="destructive" onClick={onDelete}>
                                    Excluir Campanha
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="font-semibold"
                                style={{
                                    background: `linear-gradient(135deg, ${formData.color}, ${formData.color}dd)`,
                                    color: 'white',
                                }}
                            >
                                {editingCampaign ? 'Salvar Alterações' : 'Criar Campanha'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
