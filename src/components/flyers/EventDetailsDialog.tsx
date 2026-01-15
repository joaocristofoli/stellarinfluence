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
import { FlyerEvent, FlyerAssignment } from '@/types/flyer';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Copy, MapPin, Users as UsersIcon, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getStatusLabel } from '@/utils/calendarHelpers';
import { useFlyerAssignments, useCreateFlyerAssignment, useDeleteFlyerAssignment } from '@/hooks/useFlyers';
import { useToast } from '@/hooks/use-toast';

interface EventDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (event: Omit<FlyerEvent, 'id' | 'dayCost' | 'createdAt' | 'updatedAt'>) => void;
    onDelete?: () => void;
    onDuplicate?: (event: FlyerEvent) => void;
    editingEvent?: FlyerEvent | null;
    campaignId: string;
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
    initialDate,
}: EventDetailsDialogProps) {
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

    const [formData, setFormData] = useState({
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

    // Assignments state
    const [newPersonName, setNewPersonName] = useState('');
    const [newPersonRole, setNewPersonRole] = useState<'distributor' | 'supervisor'>('distributor');
    const [newPersonContact, setNewPersonContact] = useState('');

    // Fetch assignments if editing
    const { data: assignments = [] } = useFlyerAssignments(editingEvent?.id || null);
    const createAssignment = useCreateFlyerAssignment();
    const deleteAssignment = useDeleteFlyerAssignment();

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
            });
            setSelectedDate(new Date(editingEvent.eventDate + 'T00:00:00'));
        } else if (initialDate) {
            const dateStr = format(initialDate, 'yyyy-MM-dd');
            setFormData(prev => ({ ...prev, eventDate: dateStr }));
            setSelectedDate(initialDate);
        } else {
            setFormData({
                eventDate: '',
                startTime: '',
                endTime: '',
                location: '',
                numPeople: 4,
                hourlyRate: 20,
                shiftDuration: 4,
                notes: '',
                status: 'planned',
            });
            setSelectedDate(undefined);
        }
    }, [editingEvent, initialDate, open]);

    const calculatedCost = formData.numPeople * formData.hourlyRate * formData.shiftDuration;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate) {
            alert('Por favor, selecione uma data');
            return;
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
        });
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
            });

            setNewPersonName('');
            setNewPersonContact('');
            setNewPersonRole('distributor');

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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

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

                        <div className="grid grid-cols-2 gap-4">
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
                                <Label htmlFor="shift-duration">Duração do Turno (horas)</Label>
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
                        </div>

                        {/* Custo Calculado */}
                        <div className="p-3 bg-primary/10 border-2 border-primary/20 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Custo Total do Dia:</span>
                                <span className="text-2xl font-bold text-primary">{formatCurrency(calculatedCost)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formData.numPeople} pessoas × R$ {formData.hourlyRate.toFixed(2)} × {formData.shiftDuration}h
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
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemovePerson(assignment)}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
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
                                />
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
        </Dialog>
    );
}
