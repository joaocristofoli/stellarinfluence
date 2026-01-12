import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MarketingCampaign } from '@/types/marketing';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CampaignFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (campaign: Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onDelete?: () => void;
    editingCampaign?: MarketingCampaign | null;
    companyId: string;
}

export function CampaignForm({
    open,
    onClose,
    onSave,
    onDelete,
    editingCampaign,
    companyId,
}: CampaignFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: null as Date | null,
        endDate: null as Date | null,
        status: 'planned' as 'planned' | 'in_progress' | 'completed',
    });

    useEffect(() => {
        if (editingCampaign) {
            setFormData({
                name: editingCampaign.name,
                description: editingCampaign.description || '',
                startDate: editingCampaign.startDate,
                endDate: editingCampaign.endDate,
                status: editingCampaign.status,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                startDate: null,
                endDate: null,
                status: 'planned',
            });
        }
    }, [editingCampaign, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            companyId,
            name: formData.name,
            description: formData.description || null,
            startDate: formData.startDate,
            endDate: formData.endDate,
            status: formData.status,
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl">
                        {editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
                    </DialogTitle>
                    <DialogDescription>
                        {editingCampaign
                            ? 'Atualize as informações da campanha de marketing.'
                            : 'Crie uma nova campanha para agrupar suas estratégias.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="campaign-name">Nome da Campanha *</Label>
                        <Input
                            id="campaign-name"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Campanha de Lançamento"
                            required
                        />
                    </div>

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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Data de Início</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !formData.startDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.startDate
                                            ? format(formData.startDate, 'dd/MM/yyyy', { locale: ptBR })
                                            : 'Selecione'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.startDate || undefined}
                                        onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date || null }))}
                                        initialFocus
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Data de Fim</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !formData.endDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.endDate
                                            ? format(formData.endDate, 'dd/MM/yyyy', { locale: ptBR })
                                            : 'Selecione'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.endDate || undefined}
                                        onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date || null }))}
                                        initialFocus
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="campaign-status">Status</Label>
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
                                <SelectItem value="planned">📋 Planejada</SelectItem>
                                <SelectItem value="in_progress">🚀 Em Andamento</SelectItem>
                                <SelectItem value="completed">✅ Concluída</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-between gap-3 pt-4 border-t border-border">
                        <div>
                            {editingCampaign && onDelete && (
                                <Button type="button" variant="destructive" onClick={onDelete}>
                                    Excluir
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="gradient-primary">
                                {editingCampaign ? 'Salvar' : 'Criar Campanha'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
