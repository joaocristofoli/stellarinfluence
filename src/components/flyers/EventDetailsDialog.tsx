import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
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
import { Switch } from "@/components/ui/switch";
import { FlyerEvent, FlyerAssignment, ActionType, PaymentModel } from '@/types/flyer';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Copy, MapPin, Users as UsersIcon, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getStatusLabel } from '@/utils/calendarHelpers';
import { useFlyerAssignments, useCreateFlyerAssignment, useDeleteFlyerAssignment } from '@/hooks/useFlyers';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatters';

interface EventDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (event: Omit<FlyerEvent, 'id' | 'dayCost' | 'createdAt' | 'updatedAt'>) => void;
    onDelete?: () => void;
    onDuplicate?: (event: FlyerEvent) => void;
    editingEvent?: FlyerEvent | null;
    campaignId: string;
    campaignStartDate?: string;
    campaignEndDate?: string;
    initialDate?: Date;
}

export function EventDetailsDialog({
    open,
    onClose,
    onSave,
    onDelete,
    onDuplicate,
    editingEvent,
    campaignId,
    campaignStartDate,
    campaignEndDate,
    initialDate,
}: EventDetailsDialogProps) {
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
        if (!editingEvent && !initialDate) {
            const saved = localStorage.getItem('flyerEventDraft');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.eventDate) return new Date(parsed.eventDate + 'T00:00:00');
                } catch { }
            }
        }
        return initialDate || undefined;
    });

    const [formData, setFormData] = useState(() => {
        if (!editingEvent) {
            const saved = localStorage.getItem('flyerEventDraft');
            if (saved && !initialDate) { // Only load draft if not explicitly creating from a calendar date click force
                try {
                    const parsed = JSON.parse(saved);
                    return {
                        ...parsed,
                        // Ensure optional fields fallback
                        startTime: parsed.startTime || '',
                        endTime: parsed.endTime || '',
                        location: parsed.location || '',
                        notes: parsed.notes || '',
                    };
                } catch (e) {
                    console.error(e);
                }
            }
        }

        return {
            eventDate: '',
            startTime: '',
            endTime: '',
            location: '',
            numPeople: 4,
            hourlyRate: 20,
            shiftDuration: 4,
            notes: '',
            status: 'planned' as FlyerEvent['status'],
            type: 'flyer' as ActionType,
            paymentModel: 'hourly' as PaymentModel,
            fixedPaymentValue: 0,
        };
    });

    // Assignments state
    const [newPersonName, setNewPersonName] = useState('');
    const [newPersonRole, setNewPersonRole] = useState<'distributor' | 'supervisor'>('distributor');
    const [newPersonContact, setNewPersonContact] = useState('');
    const [newPersonPayment, setNewPersonPayment] = useState<number | undefined>(undefined);

    // Fetch assignments if editing
    const { data: assignments = [] } = useFlyerAssignments(editingEvent?.id || null);
    const createAssignment = useCreateFlyerAssignment();
    const deleteAssignment = useDeleteFlyerAssignment();

    // Fetch campaign details to validate dates
    // Assuming we don't have direct access to campaign dates here easily via props (only ID passed).
    // Ideally we should pass campaign start/end via props for validation, or fetch it.
    // For now, checking if we can get it from context or just validate present/future if no campaign data.
    // Actually, looking at FlyerManager, it passes `selectedCampaign.id` but not the object.
    // We will implement basic validations first.

    useEffect(() => {
        if (editingEvent) {
            setFormData({
                eventDate: editingEvent.eventDate,
                startTime: editingEvent.startTime || '',
                endTime: editingEvent.endTime || '',
                location: editingEvent.location,
                numPeople: editingEvent.numPeople,
                hourlyRate: editingEvent.hourlyRate,
                shiftDuration: editingEvent.shiftDuration,
                notes: editingEvent.notes || '',
                status: editingEvent.status,
                type: editingEvent.type || 'flyer',
                paymentModel: editingEvent.paymentModel || 'hourly',
                fixedPaymentValue: editingEvent.fixedPaymentValue || 0,
            });
            setSelectedDate(new Date(editingEvent.eventDate + 'T00:00:00'));
        } else if (initialDate) {
            const dateStr = format(initialDate, 'yyyy-MM-dd');
            setFormData(prev => ({ ...prev, eventDate: dateStr }));
            setSelectedDate(initialDate);
        }
        // We rely on initializer for draft loading
    }, [editingEvent, initialDate, open]);

    // Auto-save draft
    useEffect(() => {
        if (!editingEvent && open && !initialDate) {
            localStorage.setItem('flyerEventDraft', JSON.stringify({
                ...formData,
                eventDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
            }));
        }
    }, [formData, selectedDate, editingEvent, open, initialDate]);

    // Calculate generic cost (for non-overridden assignments)
    const baseUnitCost = formData.paymentModel === 'hourly'
        ? formData.hourlyRate * formData.shiftDuration
        : formData.fixedPaymentValue;

    // Calculate total cost considering overrides
    const calculateTotal = () => {
        let total = 0;

        // If we are editing and have assignments, use them for calculation
        if (editingEvent && assignments.length > 0) {
            assignments.forEach(a => {
                // If assignment has override, use it. Else use baseUnitCost
                total += a.paymentAmount ?? baseUnitCost;
            });
            // If we have "ghost slots" (numPeople > assignments.length), add base cost for them
            const ghostSlots = Math.max(0, formData.numPeople - assignments.length);
            total += ghostSlots * baseUnitCost;
        } else {
            // No assignments yet, just simple math
            total = formData.numPeople * baseUnitCost;
        }
        return total;
    };

    const calculatedCost = calculateTotal();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate) {
            toast({
                title: 'Data obrigatória',
                description: 'Por favor, selecione a data do evento.',
                variant: 'destructive',
            });
            return;
        }

        // Validate Date Range
        if (campaignStartDate && campaignEndDate) {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            if (dateStr < campaignStartDate || dateStr > campaignEndDate) {
                toast({
                    title: 'Data fora do período',
                    description: `O evento deve ocorrer entre ${format(new Date(campaignStartDate), 'dd/MM/yyyy')} e ${format(new Date(campaignEndDate), 'dd/MM/yyyy')}.`,
                    variant: 'destructive',
                });
                return;
            }
        }

        onSave({
            campaignId,
            eventDate: format(selectedDate, 'yyyy-MM-dd'),
            startTime: formData.startTime || undefined,
            endTime: formData.endTime || undefined,
            location: formData.location,
            numPeople: formData.numPeople,
            hourlyRate: formData.hourlyRate,
            shiftDuration: formData.shiftDuration,
            notes: formData.notes || undefined,
            status: formData.status,
            type: formData.type,
            paymentModel: formData.paymentModel,
            fixedPaymentValue: formData.paymentModel === 'fixed' ? formData.fixedPaymentValue : undefined,
        });

        // Clear draft
        if (!editingEvent) {
            localStorage.removeItem('flyerEventDraft');
            if (!initialDate) {
                setFormData({
                    eventDate: '',
                    startTime: '',
                    endTime: '',
                    location: '',
                    numPeople: 4,
                    hourlyRate: 20,
                    shiftDuration: 4,
                    notes: '',
                    status: 'planned' as FlyerEvent['status'],
                });
                setSelectedDate(undefined);
            }
        }

        onClose();
    };

    const handleAddPerson = async () => {
        if (!newPersonName || !editingEvent) return;

        try {
            await createAssignment.mutateAsync({
                eventId: editingEvent.id,
                personName: newPersonName,
                role: newPersonRole,
                contact: newPersonContact || undefined,
                paymentAmount: newPersonPayment,
            });

            setNewPersonName('');
            setNewPersonContact('');
            setNewPersonRole('distributor');
            setNewPersonPayment(undefined);

            toast({
                title: 'Pessoa adicionada',
                description: `${newPersonName} foi adicionado(a) à equipe.`,
            });
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível adicionar a pessoa.',
                variant: 'destructive',
            });
        }
    };

    const handleRemovePerson = async (assignment: FlyerAssignment) => {
        if (!editingEvent) return;

        try {
            await deleteAssignment.mutateAsync({
                id: assignment.id,
                eventId: editingEvent.id,
            });

            toast({
                title: 'Pessoa removida',
                description: `${assignment.personName} foi removido(a) da equipe.`,
            });
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível remover a pessoa.',
                variant: 'destructive',
            });
        }
    };

    // formatCurrency removido - usar import de @/utils/formatters

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl">
                        {editingEvent ? 'Editar Evento' : 'Novo Evento de Distribuição'}
                    </DialogTitle>
                    <DialogDescription>
                        {editingEvent
                            ? 'Atualize as informações do evento de distribuição.'
                            : 'Crie um novo evento de distribuição de panfletos.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. INFORMAÇÕES BÁSICAS */}
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        <h3 className="font-semibold flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            Informações Básicas
                        </h3>

                        <div className="space-y-2">
                            <Label>Tipo de Ação</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={formData.type === 'flyer' ? 'default' : 'outline'}
                                    className={cn("flex-1", formData.type === 'flyer' ? "bg-green-600 hover:bg-green-700" : "")}
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'flyer' }))}
                                >
                                    📄 Panfletagem
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.type === 'story' ? 'default' : 'outline'}
                                    className={cn("flex-1", formData.type === 'story' ? "bg-pink-600 hover:bg-pink-700" : "")}
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'story' }))}
                                >
                                    📸 Stories
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.type === 'other' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'other' }))}
                                >
                                    Outro
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Data */}
                            <div className="space-y-2">
                                <Label>Data do Evento *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !selectedDate && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            initialFocus
                                            locale={ptBR}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Local */}
                            <div className="space-y-2">
                                <Label htmlFor="location">Local *</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="Ex: Centro, Lago/Shopping"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Horário Início */}
                            <div className="space-y-2">
                                <Label htmlFor="start-time">Horário de Início</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="start-time"
                                        type="time"
                                        value={formData.startTime}
                                        onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Horário Fim */}
                            <div className="space-y-2">
                                <Label htmlFor="end-time">Horário de Término</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="end-time"
                                        type="time"
                                        value={formData.endTime}
                                        onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. EQUIPE E CUSTO */}
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        <h3 className="font-semibold flex items-center gap-2">
                            <UsersIcon className="w-4 h-4" />
                            Equipe e Custo
                        </h3>

                        {/* Número de Pessoas */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Número de Pessoas</Label>
                                <span className="text-sm font-bold">{formData.numPeople} pessoas</span>
                            </div>
                            <Slider
                                value={[formData.numPeople]}
                                onValueChange={([value]) => setFormData(prev => ({ ...prev, numPeople: value }))}
                                min={1}
                                max={20}
                                step={1}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-3 pt-2 border-t">
                            <Label>Modelo de Pagamento</Label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="mode-hourly"
                                        checked={formData.paymentModel === 'hourly'}
                                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, paymentModel: c ? 'hourly' : 'fixed' }))}
                                    />
                                    <Label htmlFor="mode-hourly">Por Hora</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="mode-fixed"
                                        checked={formData.paymentModel === 'fixed'}
                                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, paymentModel: c ? 'fixed' : 'hourly' }))}
                                    />
                                    <Label htmlFor="mode-fixed">Valor Fixo</Label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {formData.paymentModel === 'hourly' ? (
                                <>
                                    {/* Taxa por Hora */}
                                    <div className="space-y-2">
                                        <Label htmlFor="hourly-rate">Taxa por Hora</Label>
                                        <CurrencyInput
                                            id="hourly-rate"
                                            value={formData.hourlyRate}
                                            onChange={(value) => setFormData(prev => ({ ...prev, hourlyRate: value }))}
                                            placeholder="0,00"
                                        />
                                    </div>

                                    {/* Duração do Turno */}
                                    <div className="space-y-2">
                                        <Label htmlFor="shift-duration">Duração (horas)</Label>
                                        <Input
                                            id="shift-duration"
                                            type="number"
                                            min="0.5"
                                            max="12"
                                            step="0.5"
                                            value={formData.shiftDuration}
                                            onChange={e => setFormData(prev => ({ ...prev, shiftDuration: parseFloat(e.target.value) || 0 }))}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="fixed-value">Valor Fixo por Pessoa</Label>
                                    <CurrencyInput
                                        id="fixed-value"
                                        value={formData.fixedPaymentValue}
                                        onChange={(value) => setFormData(prev => ({ ...prev, fixedPaymentValue: value }))}
                                        placeholder="0,00"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Custo Calculado */}
                        <div className="p-3 bg-primary/10 border-2 border-primary/20 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Custo Total Previsto:</span>
                                <span className="text-2xl font-bold text-primary">{formatCurrency(calculatedCost)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formData.paymentModel === 'hourly'
                                    ? `${formData.numPeople} pessoas × R$ ${formData.hourlyRate.toFixed(2)} × ${formData.shiftDuration}h`
                                    : `${formData.numPeople} pessoas × R$ ${formData.fixedPaymentValue.toFixed(2)} fixo`
                                }
                                {assignments.some(a => a.paymentAmount !== undefined) && " (com overrides)"}
                            </p>
                        </div>
                    </div>

                    {/* 3. PESSOAS ALOCADAS (apenas ao editar) */}
                    {editingEvent && (
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                            <h3 className="font-semibold">Pessoas Alocadas</h3>

                            {/* Lista de pessoas */}
                            <div className="space-y-2">
                                {assignments.map(assignment => (
                                    <div
                                        key={assignment.id}
                                        className="flex items-center justify-between p-3 bg-background rounded-lg border"
                                    >
                                        <div>
                                            <p className="font-medium">{assignment.personName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {assignment.role === 'supervisor' ? 'Supervisor' : 'Distribuidor'}
                                                {assignment.contact && ` • ${assignment.contact}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {assignment.paymentAmount && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                                    {formatCurrency(assignment.paymentAmount)}
                                                </span>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemovePerson(assignment)}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Adicionar nova pessoa */}
                            <div className="space-y-2 pt-2 border-t">
                                <Label>Adicionar Pessoa</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    <Input
                                        placeholder="Nome"
                                        value={newPersonName}
                                        onChange={e => setNewPersonName(e.target.value)}
                                        className="col-span-2"
                                    />
                                    <Select value={newPersonRole} onValueChange={(v: any) => setNewPersonRole(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="distributor">Distribuidor</SelectItem>
                                            <SelectItem value="supervisor">Supervisor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        onClick={handleAddPerson}
                                        disabled={!newPersonName}
                                        size="icon"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Input
                                    placeholder="Contato (opcional)"
                                    value={newPersonContact}
                                    onChange={e => setNewPersonContact(e.target.value)}
                                    className="col-span-1"
                                />
                                <div className="col-span-1">
                                    <CurrencyInput
                                        placeholder="Override (R$)"
                                        value={newPersonPayment || 0}
                                        onChange={(value) => setNewPersonPayment(value || undefined)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. STATUS E NOTAS */}
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        <h3 className="font-semibold">Status e Observações</h3>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: FlyerEvent['status']) =>
                                    setFormData(prev => ({ ...prev, status: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planned">📋 {getStatusLabel('planned')}</SelectItem>
                                    <SelectItem value="in_progress">🚀 {getStatusLabel('in_progress')}</SelectItem>
                                    <SelectItem value="completed">✅ {getStatusLabel('completed')}</SelectItem>
                                    <SelectItem value="cancelled">❌ {getStatusLabel('cancelled')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notas */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Observações</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Adicione observações sobre o evento..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between gap-3 pt-4 border-t border-border">
                        <div className="flex gap-2">
                            {editingEvent && onDelete && (
                                <Button type="button" variant="destructive" onClick={onDelete}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                </Button>
                            )}
                            {editingEvent && onDuplicate && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onDuplicate(editingEvent)}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicar
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="gradient-primary">
                                {editingEvent ? 'Salvar Alterações' : 'Criar Evento'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog >
    );
}
