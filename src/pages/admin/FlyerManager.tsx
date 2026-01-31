import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    List,
    Loader2,
    Plus,
    TrendingUp,
    Users,
    MapPin,
    Clock,
    DollarSign,
    Target,
    MoreVertical,
    Edit,
    Trash2,
    Copy,
    CheckCircle,
    AlertCircle,
    Sparkles,
    MousePointer2,
    Camera,
    FileText,
    MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Company } from '@/types/marketing';
import { FlyerCampaign, FlyerEvent } from '@/types/flyer';
import { useCompanies } from '@/hooks/useCompanies';
import {
    useFlyerCampaigns,
    useCreateFlyerCampaign,
    useUpdateFlyerCampaign,
    useDeleteFlyerCampaign,
    useFlyerEvents,
    useCreateFlyerEvent,
    useUpdateFlyerEvent,
    useDeleteFlyerEvent,
} from '@/hooks/useFlyers';
import { CompanySelector } from '@/components/marketing/CompanySelector';
import { CalendarView } from '@/components/flyers/CalendarView';
import { EventDetailsDialog } from '@/components/flyers/EventDetailsDialog';
import { FlyerCampaignForm } from '@/components/flyers/FlyerCampaignForm';
import { calculateCampaignStats, dateToISOString } from '@/utils/calendarHelpers';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/formatters';

const FlyerManager = () => {
    const { toast } = useToast();
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<FlyerCampaign | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

    // Dialog states
    const [campaignFormOpen, setCampaignFormOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<FlyerCampaign | null>(null);
    const [eventDialogOpen, setEventDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<FlyerEvent | null>(null);
    const [newEventDate, setNewEventDate] = useState<Date | undefined>();

    // Queries
    const { data: companies = [], isLoading: loadingCompanies } = useCompanies();
    const { data: campaigns = [], isLoading: loadingCampaigns } = useFlyerCampaigns(selectedCompany?.id || null);
    const { data: events = [], isLoading: loadingEvents } = useFlyerEvents(selectedCampaign?.id || null);

    // Mutations
    const createCampaign = useCreateFlyerCampaign();
    const updateCampaign = useUpdateFlyerCampaign();
    const deleteCampaign = useDeleteFlyerCampaign();
    const createEvent = useCreateFlyerEvent();
    const updateEvent = useUpdateFlyerEvent();
    const deleteEvent = useDeleteFlyerEvent();

    // Auto-select first company
    useEffect(() => {
        if (companies.length > 0 && !selectedCompany) {
            setSelectedCompany(companies[0]);
        }
    }, [companies, selectedCompany]);

    // Auto-select first campaign
    useEffect(() => {
        if (campaigns.length > 0 && !selectedCampaign) {
            setSelectedCampaign(campaigns[0]);
        } else if (campaigns.length === 0) {
            setSelectedCampaign(null);
        }
    }, [campaigns]);

    // Stats
    const stats = selectedCampaign ? calculateCampaignStats(events) : null;

    // All campaigns stats
    const allCampaignsStats = {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => {
            const now = new Date();
            const start = new Date(c.startDate);
            const end = new Date(c.endDate);
            return now >= start && now <= end;
        }).length,
        totalBudget: campaigns.reduce((sum, c) => sum + (c.totalBudget || 0), 0),
    };

    // formatCurrency removido - usar import de @/utils/formatters

    const formatDate = (dateString: string) => {
        return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
        });
    };

    // Handlers
    const handleSaveCampaign = async (data: Omit<FlyerCampaign, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (editingCampaign) {
                const updated = await updateCampaign.mutateAsync({ id: editingCampaign.id, ...data });
                setSelectedCampaign(updated);
                toast({
                    title: 'Campanha atualizada!',
                    description: `"${data.name}" foi atualizada com sucesso.`,
                });
            } else {
                const newCampaign = await createCampaign.mutateAsync(data);
                setSelectedCampaign(newCampaign);
                toast({
                    title: 'Campanha criada!',
                    description: `"${data.name}" foi criada com sucesso.`,
                });
            }
            setEditingCampaign(null);
            setCampaignFormOpen(false);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar a campanha.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteCampaign = async () => {
        if (!selectedCampaign || !selectedCompany) return;

        try {
            await deleteCampaign.mutateAsync({
                id: selectedCampaign.id,
                companyId: selectedCompany.id,
            });
            setSelectedCampaign(null);
            setCampaignFormOpen(false);
            setEditingCampaign(null);
            toast({
                title: 'Campanha removida',
                description: `"${selectedCampaign.name}" foi removida.`,
            });
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível remover a campanha.',
                variant: 'destructive',
            });
        }
    };

    const handleSaveEvent = async (data: Omit<FlyerEvent, 'id' | 'dayCost' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (editingEvent) {
                await updateEvent.mutateAsync({ id: editingEvent.id, ...data });
                toast({
                    title: 'Evento atualizado!',
                    description: 'O evento foi atualizado com sucesso.',
                });
            } else {
                await createEvent.mutateAsync(data);
                toast({
                    title: 'Evento criado!',
                    description: 'O evento foi criado com sucesso.',
                });
            }
            setEditingEvent(null);
            setEventDialogOpen(false);
            setNewEventDate(undefined);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar o evento.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteEvent = async () => {
        if (!editingEvent || !selectedCampaign) return;

        try {
            await deleteEvent.mutateAsync({
                id: editingEvent.id,
                campaignId: selectedCampaign.id,
            });
            setEditingEvent(null);
            setEventDialogOpen(false);
            toast({
                title: 'Evento removido',
                description: 'O evento foi removido com sucesso.',
            });
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível remover o evento.',
                variant: 'destructive',
            });
        }
    };

    const handleEventClick = (event: FlyerEvent) => {
        setEditingEvent(event);
        setEventDialogOpen(true);
    };

    const handleDateClick = (date: Date) => {
        setNewEventDate(date);
        setEditingEvent(null);
        setEventDialogOpen(true);
    };

    const handleEventDrop = async (eventId: string, newDate: string) => {
        const event = events.find(e => e.id === eventId);
        if (!event) return;

        try {
            await updateEvent.mutateAsync({
                id: eventId,
                eventDate: newDate,
            });
            toast({
                title: 'Evento movido!',
                description: 'O evento foi reagendado com sucesso.',
            });
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível mover o evento.',
                variant: 'destructive',
            });
        }
    };

    const handleDuplicateEvent = (event: FlyerEvent) => {
        setEditingEvent(null);
        setNewEventDate(new Date(event.eventDate + 'T00:00:00'));
        setEventDialogOpen(false);

        setTimeout(() => {
            createEvent.mutateAsync({
                campaignId: event.campaignId,
                eventDate: event.eventDate,
                startTime: event.startTime,
                endTime: event.endTime,
                location: event.location,
                numPeople: event.numPeople,
                hourlyRate: event.hourlyRate,
                shiftDuration: event.shiftDuration,
                notes: event.notes ? `(Cópia) ${event.notes}` : undefined,
                status: 'planned',
            });

            toast({
                title: 'Evento duplicado!',
                description: 'Um novo evento foi criado com os mesmos dados.',
            });
        }, 100);
    };

    const handleNewCampaign = () => {
        setEditingCampaign(null);
        setCampaignFormOpen(true);
    };

    const handleEditCampaign = (campaign: FlyerCampaign) => {
        setEditingCampaign(campaign);
        setCampaignFormOpen(true);
    };

    const getCampaignStatus = (campaign: FlyerCampaign) => {
        const now = new Date();
        const start = new Date(campaign.startDate);
        const end = new Date(campaign.endDate);

        if (now < start) return { label: 'Planejada', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' };
        if (now > end) return { label: 'Finalizada', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
        return { label: 'Em Andamento', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
    };

    if (loadingCompanies) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Header Premium */}
            <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link to="/admin">
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                        <CalendarIcon className="w-4 h-4 text-white" />
                                    </div>
                                    <h1 className="font-display font-bold text-xl">Gestão de Panfletagem</h1>
                                </div>
                                <p className="text-sm text-muted-foreground ml-10">
                                    Gerencie campanhas e eventos de distribuição
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
                                className="hidden sm:flex gap-2"
                            >
                                {viewMode === 'calendar' ? <List className="w-4 h-4" /> : <CalendarIcon className="w-4 h-4" />}
                                {viewMode === 'calendar' ? 'Lista' : 'Calendário'}
                            </Button>
                            <Button
                                onClick={handleNewCampaign}
                                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nova Campanha</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
                {/* Company Selector Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="w-full sm:w-auto">
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">Empresa</Label>
                        <CompanySelector
                            companies={companies}
                            selectedCompany={selectedCompany}
                            onSelectCompany={setSelectedCompany}
                            onNewCompany={() => { }}
                            onEditCompany={() => { }}
                        />
                    </div>
                    {selectedCompany && (
                        <Link to="/admin/marketing" className="text-sm text-primary hover:underline flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Ver Planejamento de Marketing
                        </Link>
                    )}
                </div>

                {selectedCompany && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                                            <Target className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Campanhas</p>
                                            <p className="text-2xl font-bold">{allCampaignsStats.totalCampaigns}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Ativas</p>
                                            <p className="text-2xl font-bold">{allCampaignsStats.activeCampaigns}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Orçamento Total</p>
                                            <p className="text-xl font-bold">{formatCurrency(allCampaignsStats.totalBudget)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Eventos</p>
                                            <p className="text-2xl font-bold">{stats?.totalDays || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Campaigns Grid */}
                        {loadingCampaigns ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : campaigns.length === 0 ? (
                            <EmptyState
                                icon={CalendarIcon}
                                title="Nenhuma campanha criada"
                                description="Crie sua primeira campanha de panfletagem para começar a organizar eventos de distribuição."
                                actionLabel="Criar Primeira Campanha"
                                onAction={handleNewCampaign}
                            />
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Campaigns List */}
                                <div className="lg:col-span-1 space-y-3">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-semibold text-lg">Campanhas</h2>
                                        <Badge variant="secondary" className="text-xs">
                                            {campaigns.length} {campaigns.length === 1 ? 'campanha' : 'campanhas'}
                                        </Badge>
                                    </div>
                                    {campaigns.map(campaign => {
                                        const status = getCampaignStatus(campaign);
                                        const isSelected = selectedCampaign?.id === campaign.id;
                                        return (
                                            <Card
                                                key={campaign.id}
                                                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${isSelected
                                                    ? 'ring-2 ring-primary shadow-lg'
                                                    : 'hover:border-primary/50'
                                                    }`}
                                                onClick={() => setSelectedCampaign(campaign)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <div
                                                                className="w-4 h-4 rounded-full mt-1 ring-2 ring-white shadow-sm"
                                                                style={{ backgroundColor: campaign.color }}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-medium truncate">{campaign.name}</h3>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                                                                </p>
                                                                {campaign.description && (
                                                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                                        {campaign.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditCampaign(campaign); }}>
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); setSelectedCampaign(campaign); handleDeleteCampaign(); }}>
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Excluir
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                                                        <Badge className={`text-xs ${status.color}`}>
                                                            {status.label}
                                                        </Badge>
                                                        <span className="text-sm font-semibold" style={{ color: campaign.color }}>
                                                            {formatCurrency(campaign.totalBudget || 0)}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>

                                {/* Calendar/List View */}
                                <div className="lg:col-span-2">
                                    {selectedCampaign ? (
                                        <Card className="h-full">
                                            <CardHeader className="pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm"
                                                            style={{ backgroundColor: selectedCampaign.color }}
                                                        />
                                                        <div>
                                                            <CardTitle className="text-lg">{selectedCampaign.name}</CardTitle>
                                                            <p className="text-sm text-muted-foreground">
                                                                {events.length} {events.length === 1 ? 'evento' : 'eventos'} •
                                                                {stats ? ` ${formatCurrency(stats.totalCost)} gasto` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => {
                                                            setEditingEvent(null);
                                                            setNewEventDate(new Date());
                                                            setEventDialogOpen(true);
                                                        }}
                                                        size="sm"
                                                        className="gap-2"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${selectedCampaign.color}, ${selectedCampaign.color}dd)`,
                                                        }}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Novo Evento
                                                    </Button>
                                                </div>

                                                {/* Campaign Stats */}
                                                {stats && (
                                                    <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/50">
                                                        <div className="text-center">
                                                            <p className="text-xs text-muted-foreground">Custo Total</p>
                                                            <p className="font-bold" style={{ color: selectedCampaign.color }}>
                                                                {formatCurrency(stats.totalCost)}
                                                            </p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-muted-foreground">Dias</p>
                                                            <p className="font-bold">{stats.totalDays}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-muted-foreground">Pessoas</p>
                                                            <p className="font-bold">{stats.totalPeople}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-muted-foreground">Média/Dia</p>
                                                            <p className="font-bold">{formatCurrency(stats.avgCostPerDay)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                {loadingEvents ? (
                                                    <div className="flex items-center justify-center py-16">
                                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                    </div>
                                                ) : viewMode === 'calendar' ? (
                                                    <CalendarView
                                                        events={events}
                                                        campaign={selectedCampaign}
                                                        onEventClick={handleEventClick}
                                                        onDateClick={handleDateClick}
                                                        onEventDrop={handleEventDrop}
                                                    />
                                                ) : (
                                                    <div className="space-y-2 max-h-[500px] overflow-auto pr-2">
                                                        {events.length === 0 ? (
                                                            <p className="text-center text-muted-foreground py-8">
                                                                Nenhum evento criado. Clique em "Novo Evento" para começar!
                                                            </p>
                                                        ) : (
                                                        ): (
                                                                events.map(event => {
                                                                // Icon selection
                                                                const Icon = event.type === 'story' ? Camera : (event.type === 'other' ? MoreHorizontal : MapPin);

                                                        return (
                                                        <div
                                                            key={event.id}
                                                            onClick={() => handleEventClick(event)}
                                                            className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-all hover:shadow-sm"
                                                            style={{ borderLeftWidth: '4px', borderLeftColor: selectedCampaign.color }}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn("p-2 rounded-full",
                                                                        event.type === 'story' ? "bg-pink-100 text-pink-600" :
                                                                            event.type === 'other' ? "bg-gray-100 text-gray-600" :
                                                                                "bg-green-100 text-green-600"
                                                                    )}>
                                                                        <Icon className="w-4 h-4" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">{event.location}</p>
                                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                            <span>{formatDate(event.eventDate)}</span>
                                                                            {event.startTime && <span>• {event.startTime}</span>}
                                                                            {event.type === 'story' && <Badge variant="outline" className="text-[10px] h-5">Story</Badge>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-bold" style={{ color: selectedCampaign.color }}>
                                                                        {formatCurrency(event.dayCost || 0)}
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {event.numPeople} {event.type === 'story' ? 'influencers' : 'pessoas'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                            )})
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <EmptyState
                                            icon={MousePointer2}
                                            title="Selecione uma campanha"
                                            description="Clique em uma campanha na lista ao lado para gerenciar seus eventos e ver detalhes."
                                            className="h-full"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {!selectedCompany && (
                    <EmptyState
                        icon={Users}
                        title="Selecione uma empresa"
                        description="Escolha uma empresa acima para gerenciar suas campanhas de panfletagem."
                        className="py-24"
                    />
                )}
            </main>

            {/* Dialogs */}
            {selectedCompany && (
                <>
                    <FlyerCampaignForm
                        open={campaignFormOpen}
                        onClose={() => {
                            setCampaignFormOpen(false);
                            setEditingCampaign(null);
                        }}
                        onSave={handleSaveCampaign}
                        onDelete={editingCampaign ? handleDeleteCampaign : undefined}
                        editingCampaign={editingCampaign}
                        companyId={selectedCompany.id}
                    />

                    {selectedCampaign && (
                        <EventDetailsDialog
                            open={eventDialogOpen}
                            onClose={() => {
                                setEventDialogOpen(false);
                                setEditingEvent(null);
                                setNewEventDate(undefined);
                            }}
                            onSave={handleSaveEvent}
                            onDelete={editingEvent ? handleDeleteEvent : undefined}
                            onDuplicate={handleDuplicateEvent}
                            editingEvent={editingEvent}
                            campaignId={selectedCampaign.id}
                            campaignStartDate={selectedCampaign.startDate}
                            campaignEndDate={selectedCampaign.endDate}
                            initialDate={newEventDate}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default FlyerManager;
