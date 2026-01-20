import { useState, useEffect, useMemo } from 'react';
import { Plus, Loader2, FileDown, ArrowLeft, Link2, Copy, Check, Calendar, LayoutGrid, ClipboardList, Building2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/utils/formatters';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { StrategyCard } from '@/components/marketing/StrategyCard';
import { StrategyForm } from '@/components/marketing/StrategyForm';
import { ChannelFilter } from '@/components/marketing/ChannelFilter';
import { StatsOverview } from '@/components/marketing/StatsOverview';
import { CompanySelector } from '@/components/marketing/CompanySelector';
import { CompanyForm } from '@/components/marketing/CompanyForm';
import { ContractPreviewDialog } from '@/components/marketing/ContractPreviewDialog';
import { PremiumEmptyState } from '@/components/ui/premium-empty-state'; // Added
import { GlassSkeleton } from '@/components/ui/glass-skeleton'; // Added
import { CampaignSelector } from '@/components/marketing/CampaignSelector';
import { CampaignForm } from '@/components/marketing/CampaignForm';
import { CampaignStats } from '@/components/marketing/CampaignStats';
import { MarketingStrategy, MarketingCampaign, ChannelType, Company } from '@/types/marketing';
import { exportToPdf } from '@/utils/exportPdf';
import { createShareableLink, getShareableUrl } from '@/utils/shareableLink';
import { useToast } from '@/hooks/use-toast';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompanies';
import { useStrategies, useStrategiesRealtime, useCreateStrategy, useUpdateStrategy, useDeleteStrategy } from '@/hooks/useStrategies';
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign } from '@/hooks/useCampaigns';
import { exportContract } from '@/utils/exportContract';
// FlyerIntegrationCard REMOVIDO - Flyers agora integrados no CampaignCalendar unificado
import { CampaignCalendar } from '@/components/marketing/CampaignCalendar';
import { BigCalendarView } from '@/components/marketing/BigCalendarView';
import { CalendarToolbar } from '@/components/marketing/CalendarToolbar'; // Added Toolbar
import { useFlyerEventsByCompany, useUpdateFlyerEvent } from '@/hooks/useFlyers';
import { EventDetailsDialog } from '@/components/flyers/EventDetailsDialog';
import { FlyerEvent } from '@/types/flyer';
import { supabase } from '@/integrations/supabase/client';

const MarketingPlanner = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlCompanyId = searchParams.get('companyId');
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [companyFormOpen, setCompanyFormOpen] = useState(false);
    const [editingCompanyMode, setEditingCompanyMode] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [contractPreviewOpen, setContractPreviewOpen] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState<MarketingStrategy | null>(null);

    // MAJ-008 fix: Persistir filtros de canal em localStorage
    const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>(() => {
        try {
            const stored = localStorage.getItem('marketing-planner-channel-filters');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Campaign state
    const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | 'all' | 'none'>('all');
    const [campaignFormOpen, setCampaignFormOpen] = useState(false);
    const [editingCampaignMode, setEditingCampaignMode] = useState(false);

    // Share state
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [hideFinancials, setHideFinancials] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [shareLoading, setShareLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // MAJ-007 fix: Persistir viewMode em localStorage
    const [viewMode, setViewMode] = useState<'cards' | 'calendar'>(() => {
        try {
            const stored = localStorage.getItem('marketing-planner-view-mode');
            return (stored === 'cards' || stored === 'calendar') ? stored : 'cards';
        } catch {
            return 'cards';
        }
    });

    // Selected date for pre-filling form when clicking on calendar
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());


    // State for editing flyer events inline
    const [selectedFlyerEvent, setSelectedFlyerEvent] = useState<FlyerEvent | null>(null);
    const [flyerDialogOpen, setFlyerDialogOpen] = useState(false);

    // Creators for calendar
    const [creators, setCreators] = useState<{ id: string; name: string; image_url?: string }[]>([]);

    // Fetch creators for calendar display
    useEffect(() => {
        const fetchCreators = async () => {
            const { data } = await supabase.from('creators').select('id, name, image_url');
            if (data) setCreators(data);
        };
        fetchCreators();
    }, []);

    // MAJ-007 fix: Persistir viewMode quando mudar
    useEffect(() => {
        localStorage.setItem('marketing-planner-view-mode', viewMode);
    }, [viewMode]);

    // MAJ-008 fix: Persistir selectedChannels quando mudar
    useEffect(() => {
        localStorage.setItem('marketing-planner-channel-filters', JSON.stringify(selectedChannels));
    }, [selectedChannels]);

    // Queries
    const { data: companies = [], isLoading: loadingCompanies } = useCompanies();
    const { data: strategies = [], isLoading: loadingStrategies } = useStrategies(selectedCompany?.id || null);
    // REALTIME: Atualização automática quando outro usuário modificar
    useStrategiesRealtime(selectedCompany?.id || null);
    const { data: campaigns = [], isLoading: loadingCampaigns } = useCampaigns(selectedCompany?.id || null);
    const { data: flyerEvents = [] } = useFlyerEventsByCompany(selectedCompany?.id || null);

    // Mutations
    const createCompany = useCreateCompany();
    const updateCompany = useUpdateCompany();
    const deleteCompany = useDeleteCompany();
    const createStrategy = useCreateStrategy();
    const updateStrategy = useUpdateStrategy();
    const deleteStrategy = useDeleteStrategy();
    const createCampaign = useCreateCampaign();
    const updateCampaign = useUpdateCampaign();
    const deleteCampaign = useDeleteCampaign();
    const updateFlyerEvent = useUpdateFlyerEvent();

    // Auto-select company from URL, LocalStorage, or first available
    useEffect(() => {
        if (companies.length > 0 && !selectedCompany) {
            // 1. Try URL Param
            if (urlCompanyId) {
                const found = companies.find(c => c.id === urlCompanyId);
                if (found) {
                    setSelectedCompany(found);
                    localStorage.setItem('marketing-planner-last-company-id', found.id);
                    return;
                }
            }

            // 2. Try LocalStorage (The Amnesia Cure)
            const lastId = localStorage.getItem('marketing-planner-last-company-id');
            if (lastId) {
                const found = companies.find(c => c.id === lastId);
                if (found) {
                    setSelectedCompany(found);
                    // Sync URL immediately to match state
                    setSearchParams(prev => {
                        prev.set('companyId', found.id);
                        return prev;
                    });
                    return;
                }
            }

            // 3. Fallback to first
            if (companies[0]) {
                setSelectedCompany(companies[0]);
                // Set URL to be explicit
                setSearchParams(prev => {
                    prev.set('companyId', companies[0].id);
                    return prev;
                });
            }
        }
    }, [companies, selectedCompany, urlCompanyId, setSearchParams]);

    // Update LocalStorage on change
    useEffect(() => {
        if (selectedCompany) {
            localStorage.setItem('marketing-planner-last-company-id', selectedCompany.id);
        }
    }, [selectedCompany]);

    // Reset campaign selection when company changes
    useEffect(() => {
        if (selectedCompany?.id) {
            setSelectedCampaign('all');
        }
    }, [selectedCompany?.id]);

    const totalBudget = strategies.reduce((sum, s) => sum + s.budget, 0);

    // Filter strategies by channel and campaign
    const filteredStrategies = useMemo(() => {
        let filtered = strategies;

        // Filter by campaign
        if (selectedCampaign === 'none') {
            filtered = filtered.filter(s => !s.campaignId);
        } else if (selectedCampaign !== 'all' && selectedCampaign) {
            filtered = filtered.filter(s => s.campaignId === selectedCampaign.id);
        }

        // Filter by channel
        if (selectedChannels.length > 0) {
            filtered = filtered.filter(s => selectedChannels.includes(s.channelType));
        }

        return filtered;
    }, [strategies, selectedCampaign, selectedChannels]);

    // Get the actual campaign object for stats
    const activeCampaign = selectedCampaign !== 'all' && selectedCampaign !== 'none' ? selectedCampaign : null;

    // Dynamic theme based on company colors
    const companyTheme = useMemo(() => {
        if (!selectedCompany) return {};
        const primary = selectedCompany.primaryColor || '#7c3aed';
        const secondary = selectedCompany.secondaryColor || '#f97316';
        return {
            '--company-primary': primary,
            '--company-secondary': secondary,
            '--company-primary-light': `${primary}20`,
            '--company-primary-medium': `${primary}40`,
            '--company-gradient': `linear-gradient(135deg, ${primary}, ${secondary})`,
        } as React.CSSProperties;
    }, [selectedCompany]);


    const handleSaveStrategy = async (data: Omit<MarketingStrategy, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (editingStrategy) {
                await updateStrategy.mutateAsync({ id: editingStrategy.id, ...data });
                toast({
                    title: 'Estratégia atualizada!',
                    description: `"${data.name}" foi atualizada com sucesso.`,
                });
            } else {
                await createStrategy.mutateAsync(data);
                toast({
                    title: 'Estratégia criada!',
                    description: `"${data.name}" foi adicionada ao planejamento.`,
                });
            }
            setEditingStrategy(null);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar a estratégia.',
                variant: 'destructive',
            });
        }
    };

    const handleEditStrategy = (strategy: MarketingStrategy) => {
        setEditingStrategy(strategy);
        setFormOpen(true);
    };

    const handleDeleteStrategy = async (id: string) => {
        if (!selectedCompany) return;

        const strategy = strategies.find(s => s.id === id);
        try {
            await deleteStrategy.mutateAsync({ id, companyId: selectedCompany.id });
            toast({
                title: 'Estratégia removida',
                description: strategy ? `"${strategy.name}" foi removida.` : 'Estratégia removida.',
            });
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível remover a estratégia.',
                variant: 'destructive',
            });
        }
    };

    const handleToggleChannel = (channel: ChannelType) => {
        setSelectedChannels(prev =>
            prev.includes(channel)
                ? prev.filter(c => c !== channel)
                : [...prev, channel]
        );
    };

    const handleClearFilters = () => {
        setSelectedChannels([]);
    };

    const handleExport = () => {
        if (strategies.length === 0) {
            toast({
                title: 'Nenhuma estratégia',
                description: 'Adicione estratégias antes de exportar.',
                variant: 'destructive',
            });
            return;
        }
        exportToPdf(strategies, selectedCompany);
        toast({
            title: 'Exportando PDF',
            description: 'O documento será aberto para impressão.',
        });
    };

    const handleExportContract = () => {
        if (!selectedCompany) return;
        if (strategies.length === 0) {
            toast({
                title: 'Sem estratégias',
                description: 'Adicione estratégias para gerar o contrato.',
                variant: 'destructive',
            });
            return;
        }

        if (!selectedCompany.cnpj && !selectedCompany.address) {
            toast({
                title: 'Dados incompletos',
                description: 'Recomendamos adicionar CNPJ e Endereço da empresa para um contrato completo.',
                variant: 'default',
            });
        }

        setContractPreviewOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setEditingStrategy(null);
    };

    const handleSaveCompany = async (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (editingCompanyMode && selectedCompany) {
                const updated = await updateCompany.mutateAsync({ id: selectedCompany.id, ...data });
                setSelectedCompany(updated);
                toast({
                    title: 'Empresa atualizada!',
                    description: `"${data.name}" foi atualizada com sucesso.`,
                });
            } else {
                const newCompany = await createCompany.mutateAsync(data);
                setSelectedCompany(newCompany);
                toast({
                    title: 'Empresa criada!',
                    description: `"${data.name}" foi cadastrada. Comece a criar suas estratégias!`,
                });
            }
            setEditingCompanyMode(false);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar a empresa.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteCompany = async () => {
        if (!selectedCompany) return;

        try {
            await deleteCompany.mutateAsync(selectedCompany.id);
            setSelectedCompany(null);
            setCompanyFormOpen(false);
            setEditingCompanyMode(false);
            toast({
                title: 'Empresa removida',
                description: `"${selectedCompany.name}" foi removida junto com suas estratégias.`,
            });
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível remover a empresa.',
                variant: 'destructive',
            });
        }
    };

    const handleNewCompany = () => {
        setEditingCompanyMode(false);
        setCompanyFormOpen(true);
    };

    const handleEditCompany = () => {
        setEditingCompanyMode(true);
        setCompanyFormOpen(true);
    };

    // Campaign handlers
    const handleSaveCampaign = async (data: Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (editingCampaignMode && selectedCampaign !== 'all' && selectedCampaign !== 'none') {
                const updated = await updateCampaign.mutateAsync({ id: selectedCampaign.id, ...data });
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
                    description: `"${data.name}" foi criada. Comece a adicionar estratégias!`,
                });
            }
            setEditingCampaignMode(false);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar a campanha.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteCampaign = async () => {
        if (selectedCampaign === 'all' || selectedCampaign === 'none' || !selectedCampaign) return;

        try {
            await deleteCampaign.mutateAsync({ id: selectedCampaign.id, companyId: selectedCompany!.id });
            setSelectedCampaign('all');
            setCampaignFormOpen(false);
            setEditingCampaignMode(false);
            toast({
                title: 'Campanha removida',
                description: `"${selectedCampaign.name}" foi removida. Estratégias foram desvinculadas.`,
            });
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível remover a campanha.',
                variant: 'destructive',
            });
        }
    };

    const handleNewCampaign = () => {
        setEditingCampaignMode(false);
        setCampaignFormOpen(true);
    };

    const handleEditCampaign = () => {
        setEditingCampaignMode(true);
        setCampaignFormOpen(true);
    };

    // formatCurrency importado de @/utils/formatters

    // Share handler - now split into open dialog and generate link
    const openShareDialog = () => {
        if (!selectedCompany) return;
        setShareLink(''); // Clear any previous link
        setShareDialogOpen(true);
    };

    const generateShareLink = async () => {
        if (!selectedCompany) return;

        setShareLoading(true);
        try {
            const shareId = await createShareableLink(selectedCompany, strategies, hideFinancials);
            const url = getShareableUrl(shareId);
            setShareLink(url);
            toast({
                title: hideFinancials ? '🔒 Link gerado (valores ocultos)' : '💰 Link gerado (valores visíveis)',
                description: 'Link pronto para copiar!',
            });
        } catch (error) {
            console.error('Error creating share link:', error);
            toast({
                title: 'Erro ao compartilhar',
                description: 'Não foi possível gerar o link de compartilhamento.',
                variant: 'destructive',
            });
        } finally {
            setShareLoading(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({
                title: 'Link copiado!',
                description: 'O link foi copiado para a área de transferência.',
            });
        } catch (error) {
            toast({
                title: 'Erro ao copiar',
                description: 'Não foi possível copiar o link.',
                variant: 'destructive',
            });
        }
    };

    const handleEventDrop = async ({ event, start, end }: any) => {
        if (!selectedCompany) return;
        const strategy = event.resource as MarketingStrategy;
        try {
            await updateStrategy.mutateAsync({
                id: strategy.id,
                companyId: selectedCompany.id,
                startDate: start,
                endDate: end,
            });
            toast({
                title: 'Data atualizada!',
                description: `"${strategy.name}" movido para ${start.toLocaleDateString()}.`,
            });
        } catch (error) {
            toast({
                title: 'Erro ao mover',
                description: 'Não foi possível atualizar a data.',
                variant: 'destructive',
            });
        }
    };

    if (loadingCompanies) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background transition-all duration-300" style={companyTheme}>
            {/* Dynamic Theme Accent Bar */}
            {selectedCompany && (
                <div
                    className="h-1 w-full"
                    style={{ background: `var(--company-gradient)` }}
                />
            )}
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link to="/admin">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <CompanySelector
                                    companies={companies}
                                    selectedCompany={selectedCompany}
                                    onNewCompany={handleNewCompany}
                                    onEditCompany={handleEditCompany}
                                    onSelectCompany={(company) => {
                                        setSelectedCompany(company);
                                        // BRG-001: Sync Context to URL (Context Bridge)
                                        if (company) {
                                            setSearchParams(prev => {
                                                prev.set('companyId', company.id);
                                                return prev;
                                            });
                                        }
                                    }}
                                />
                                {selectedCompany && (
                                    <p className="text-xs text-muted-foreground mt-1 ml-1">
                                        {strategies.length} estratégias • {formatCurrency(totalBudget)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={openShareDialog}
                                variant="outline"
                                className="gap-2"
                                disabled={shareLoading || strategies.length === 0}
                            >
                                {shareLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Link2 className="w-4 h-4" />
                                )}
                                Compartilhar
                            </Button>
                            <Button
                                onClick={handleExportContract}
                                variant="outline"
                                className="gap-2"
                            >
                                <FileDown className="w-4 h-4" />
                                Gerar Contrato
                            </Button>
                            {selectedCompany && (
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => navigate(`/admin/calendar/${selectedCompany.id}`)}
                                >
                                    <Calendar className="w-4 h-4" />
                                    Calendário Tela Cheia
                                </Button>
                            )}
                            <Button
                                onClick={handleExport}
                                className="gap-2 shadow-lg font-semibold"
                                style={{
                                    background: 'var(--company-gradient)',
                                    color: 'white',
                                    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                                }}
                            >
                                <FileDown className="w-4 h-4" />
                                Exportar Planejamento
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8">
                <div className="flex items-center justify-between">
                    {/* CompanySelector moved to Header for persistence */}
                    <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
                        Planejamento & Estratégia
                    </div>
                </div>

                {selectedCompany ? (
                    <>
                        {/* Campaign Selector Row */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <CampaignSelector
                                campaigns={campaigns}
                                selectedCampaign={selectedCampaign}
                                onSelectCampaign={setSelectedCampaign}
                                onNewCampaign={handleNewCampaign}
                                onEditCampaign={handleEditCampaign}
                                disabled={loadingCampaigns}
                            />
                        </div>

                        {/* Campaign Stats - shows when viewing specific campaign or all */}
                        <CampaignStats
                            strategies={filteredStrategies}
                            campaign={activeCampaign}
                        />

                        <StatsOverview strategies={strategies} />

                        {/* FlyerIntegrationCard REMOVIDO - Flyers agora aparecem no calendário unificado */}

                        <ChannelFilter
                            selectedChannels={selectedChannels}
                            onToggleChannel={handleToggleChannel}
                            onClearFilters={handleClearFilters}
                        />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h2 className="font-display text-2xl font-bold text-foreground">
                                    Estratégias de Marketing
                                </h2>
                                {/* View Mode Toggle */}
                                <div className="flex gap-1 bg-muted rounded-lg p-1">
                                    <Button
                                        variant={viewMode === 'cards' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('cards')}
                                        className="gap-1"
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                        Cards
                                    </Button>
                                    <Button
                                        variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('calendar')}
                                        className="gap-1"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Calendário
                                    </Button>
                                </div>
                            </div>
                            <Button
                                onClick={() => setFormOpen(true)}
                                className="gap-2 shadow-lg hover:opacity-90 transition-all font-semibold"
                                style={{
                                    background: 'var(--company-gradient)',
                                    color: 'white',
                                    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                                }}
                            >
                                <Plus className="w-4 h-4" />
                                Nova Estratégia
                            </Button>
                        </div>

                        {loadingStrategies ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="space-y-4">
                                        <GlassSkeleton className="h-[200px] w-full rounded-xl" />
                                        <div className="space-y-2">
                                            <GlassSkeleton className="h-4 w-[250px]" />
                                            <GlassSkeleton className="h-4 w-[200px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredStrategies.length === 0 ? (
                            <PremiumEmptyState
                                icon={ClipboardList}
                                title={strategies.length === 0 ? 'Planejamento em branco' : 'Nenhuma estratégia encontrada'}
                                description={strategies.length === 0
                                    ? `Comece criando sua primeira estratégia de marketing para ${selectedCompany.name} e domine seu mercado.`
                                    : 'Tente ajustar os filtros para encontrar o que procura.'
                                }
                                actionLabel={strategies.length === 0 ? 'Criar Primeira Estratégia' : undefined}
                                onAction={strategies.length === 0 ? () => setFormOpen(true) : undefined}
                            />
                        ) : viewMode === 'calendar' ? (
                            <div className="bg-black/20 rounded-xl border border-white/5 p-4 md:p-6 backdrop-blur-sm shadow-2xl">
                                {/* Toolbar Premium */}
                                <CalendarToolbar
                                    totalBudget={activeCampaign ? (activeCampaign as any).totalBudget || totalBudget : totalBudget}
                                    onExport={handleExport}
                                    onViewChange={(v) => console.log(v)}
                                    currentView="month"
                                    date={currentDate}
                                    onNavigate={(action) => {
                                        const newDate = new Date(currentDate);
                                        if (action === 'TODAY') {
                                            setCurrentDate(new Date());
                                        } else if (action === 'PREV') {
                                            newDate.setMonth(newDate.getMonth() - 1);
                                            setCurrentDate(newDate);
                                        } else if (action === 'NEXT') {
                                            newDate.setMonth(newDate.getMonth() + 1);
                                            setCurrentDate(newDate);
                                        }
                                    }}
                                />

                                <BigCalendarView
                                    strategies={filteredStrategies}
                                    companyId={selectedCompany.id}
                                    currentDate={currentDate}
                                    onNavigate={(date) => setCurrentDate(date)}
                                    onStrategyClick={handleEditStrategy}
                                    onCreateRange={(start, end) => {
                                        setEditingStrategy(null);
                                        setSelectedDate(start);
                                        // TODO: Pass 'end' to form via state store or prop
                                        setFormOpen(true);
                                        toast({ title: "Bora criar! 🚀", description: "Selecione os detalhes da nova ação." });
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredStrategies.map(strategy => (
                                    <StrategyCard
                                        key={strategy.id}
                                        strategy={strategy}
                                        allStrategies={strategies}
                                        onEdit={handleEditStrategy}
                                        onDelete={handleDeleteStrategy}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <PremiumEmptyState
                        icon={Building2}
                        title="Bem-vindo ao Command Center"
                        description="Cadastre sua primeira empresa para desbloquear o poder do planejamento de marketing estratégico."
                        actionLabel="Cadastrar Primeira Empresa"
                        onAction={handleNewCompany}
                        className="min-h-[60vh]"
                    />
                )}
            </main>

            {
                selectedCompany && (
                    <>
                        <StrategyForm
                            open={formOpen}
                            onClose={() => {
                                handleCloseForm();
                                setSelectedDate(null);
                            }}
                            onSave={handleSaveStrategy}
                            editingStrategy={editingStrategy}
                            existingStrategies={strategies}
                            companyId={selectedCompany.id}
                            campaigns={campaigns}
                            defaultCampaignId={activeCampaign?.id || null}
                            defaultDate={selectedDate}
                        />
                        <ContractPreviewDialog
                            open={contractPreviewOpen}
                            onClose={() => setContractPreviewOpen(false)}
                            company={selectedCompany}
                            strategies={strategies}
                        />
                        <CampaignForm
                            open={campaignFormOpen}
                            onClose={() => {
                                setCampaignFormOpen(false);
                                setEditingCampaignMode(false);
                            }}
                            onSave={handleSaveCampaign}
                            onDelete={editingCampaignMode ? handleDeleteCampaign : undefined}
                            editingCampaign={editingCampaignMode && selectedCampaign !== 'all' && selectedCampaign !== 'none' ? selectedCampaign : null}
                            companyId={selectedCompany.id}
                        />
                    </>
                )
            }

            <CompanyForm
                open={companyFormOpen}
                onClose={() => {
                    setCompanyFormOpen(false);
                    setEditingCompanyMode(false);
                }}
                onSave={handleSaveCompany}
                onDelete={editingCompanyMode ? handleDeleteCompany : undefined}
                editingCompany={editingCompanyMode ? selectedCompany : null}
            />

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Link2 className="w-5 h-5 text-purple-600" />
                            Compartilhar Planejamento
                        </DialogTitle>
                        <DialogDescription>
                            Qualquer pessoa com este link pode visualizar o planejamento.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Privacy Toggle */}
                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2">
                                {hideFinancials ? (
                                    <span className="text-lg">🔒</span>
                                ) : (
                                    <span className="text-lg">💰</span>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                        {hideFinancials ? 'Valores Ocultos' : 'Valores Visíveis'}
                                    </p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400">
                                        {hideFinancials
                                            ? 'Cliente NÃO verá orçamentos'
                                            : 'Cliente verá todos os valores'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!hideFinancials}
                                    onChange={(e) => setHideFinancials(!e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        {/* Conditional: Show generate button OR link input */}
                        {!shareLink ? (
                            <Button
                                onClick={generateShareLink}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
                                disabled={shareLoading}
                            >
                                {shareLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Link2 className="w-4 h-4" />
                                )}
                                {shareLoading ? 'Gerando...' : 'Gerar Link de Compartilhamento'}
                            </Button>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={shareLink}
                                        readOnly
                                        className="flex-1 text-sm bg-muted"
                                    />
                                    <Button
                                        onClick={handleCopyLink}
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                                    <span className="text-lg">⏰</span>
                                    <span>Este link expira em <strong>24 horas</strong></span>
                                </div>
                                <Button
                                    onClick={() => setShareLink('')}
                                    variant="ghost"
                                    size="sm"
                                    className="text-purple-600 hover:text-purple-700"
                                >
                                    ↻ Gerar novo link
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog para editar Flyer Events inline */}
            {selectedFlyerEvent && (
                <EventDetailsDialog
                    open={flyerDialogOpen}
                    onClose={() => {
                        setFlyerDialogOpen(false);
                        setSelectedFlyerEvent(null);
                    }}
                    onSave={async (eventData) => {
                        try {
                            await updateFlyerEvent.mutateAsync({
                                id: selectedFlyerEvent.id,
                                ...eventData,
                            });
                            toast({
                                title: '✅ Evento atualizado!',
                                description: `Panfletagem em ${eventData.location} salva com sucesso.`,
                            });
                            setFlyerDialogOpen(false);
                            setSelectedFlyerEvent(null);
                        } catch (error) {
                            toast({
                                title: 'Erro ao salvar',
                                description: 'Não foi possível atualizar o evento.',
                                variant: 'destructive',
                            });
                        }
                    }}
                    editingEvent={selectedFlyerEvent}
                    campaignId={selectedFlyerEvent.campaignId}
                />
            )}
        </div >
    );
};

export default MarketingPlanner;

