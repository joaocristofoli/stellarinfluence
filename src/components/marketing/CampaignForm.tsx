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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MarketingCampaign } from '@/types/marketing';
import { Calendar } from '@/components/ui/calendar';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
    // MAJ-004 fix: Estado para confirmação de delete
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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

    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // CRIT-004 fix: Validar datas
        if (formData.startDate && formData.endDate) {
            if (formData.endDate < formData.startDate) {
                toast({
                    title: 'Erro de validação',
                    description: 'A data de fim não pode ser anterior à data de início.',
                    variant: 'destructive',
                });
                return;
            }
        }

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
        <>
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

                        <div className="space-y-2">
                            <Label>Período da Campanha</Label>
                            <DatePickerWithRange
                                date={
                                    formData.startDate && formData.endDate
                                        ? { from: formData.startDate, to: formData.endDate }
                                        : undefined
                                }
                                setDate={(range) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        startDate: range?.from || null,
                                        endDate: range?.to || null
                                    }));
                                }}
                            />
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
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => setDeleteConfirmOpen(true)}
                                    >
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

            {/* MAJ-004 fix: AlertDialog de confirmação */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir campanha?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir "{editingCampaign?.name}"?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                onDelete?.();
                                setDeleteConfirmOpen(false);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
