import { useState, useEffect, useMemo } from 'react';
import { Plus, Loader2, FileDown, ArrowLeft, Link2, Copy, Check, Calendar, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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
import { CampaignSelector } from '@/components/marketing/CampaignSelector';
import { CampaignForm } from '@/components/marketing/CampaignForm';
import { CampaignStats } from '@/components/marketing/CampaignStats';
import { MarketingStrategy, MarketingCampaign, ChannelType, Company } from '@/types/marketing';
import { exportToPdf } from '@/utils/exportPdf';
import { createShareableLink, getShareableUrl } from '@/utils/shareableLink';
import { useToast } from '@/hooks/use-toast';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompanies';
import { useStrategies, useCreateStrategy, useUpdateStrategy, useDeleteStrategy } from '@/hooks/useStrategies';
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign } from '@/hooks/useCampaigns';
import { exportContract } from '@/utils/exportContract';
import { FlyerIntegrationCard } from '@/components/marketing/FlyerIntegrationCard';
import { CampaignCalendar } from '@/components/marketing/CampaignCalendar';
import { supabase } from '@/integrations/supabase/client';

const MarketingPlanner = () => {
    const { toast } = useToast();
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [companyFormOpen, setCompanyFormOpen] = useState(false);
    const [editingCompanyMode, setEditingCompanyMode] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [contractPreviewOpen, setContractPreviewOpen] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState<MarketingStrategy | null>(null);
    const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>([]);

    // Campaign state
    const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | 'all' | 'none'>('all');
    const [campaignFormOpen, setCampaignFormOpen] = useState(false);
    const [editingCampaignMode, setEditingCampaignMode] = useState(false);

    // Share state
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [shareLoading, setShareLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // View mode state - Cards or Calendar
    const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');

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

    // Queries
    const { data: companies = [], isLoading: loadingCompanies } = useCompanies();
    const { data: strategies = [], isLoading: loadingStrategies } = useStrategies(selectedCompany?.id || null);
    const { data: campaigns = [], isLoading: loadingCampaigns } = useCampaigns(selectedCompany?.id || null);

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

    // Auto-select first company
    useEffect(() => {
        if (companies.length > 0 && !selectedCompany) {
            setSelectedCompany(companies[0]);
        }
    }, [companies, selectedCompany]);

    // Reset campaign selection when company changes
    useEffect(() => {
        setSelectedCampaign('all');
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

    // Share handler
    const handleShare = async () => {
        if (!selectedCompany) return;

        setShareLoading(true);
        try {
            const shareId = await createShareableLink(selectedCompany, strategies);
            const url = getShareableUrl(shareId);
            setShareLink(url);
            setShareDialogOpen(true);
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
                            {selectedCompany?.logoUrl && (
                                <img
                                    src={selectedCompany.logoUrl}
                                    alt={selectedCompany.name}
                                    className="h-10 w-10 rounded-lg object-cover border-2"
                                    style={{ borderColor: 'var(--company-primary)' }}
                                />
                            )}
                            <div>
                                <h1 className="font-display font-bold text-xl flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ background: 'var(--company-gradient)' }}
                                    />
                                    Planejamento de Marketing
                                </h1>
                                {selectedCompany && (
                                    <p className="text-sm text-muted-foreground">
                                        {selectedCompany.name} • {strategies.length} estratégias • {formatCurrency(totalBudget)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleShare}
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
                    <CompanySelector
                        companies={companies}
                        selectedCompany={selectedCompany}
                        onSelectCompany={setSelectedCompany}
                        onNewCompany={handleNewCompany}
                        onEditCompany={handleEditCompany}
                    />
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

                        {/* Flyer Integration */}
                        <FlyerIntegrationCard companyId={selectedCompany.id} />

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
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : filteredStrategies.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-4xl">📋</span>
                                </div>
                                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                                    {strategies.length === 0
                                        ? 'Nenhuma estratégia ainda'
                                        : 'Nenhuma estratégia encontrada'
                                    }
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    {strategies.length === 0
                                        ? `Comece criando sua primeira estratégia de marketing para ${selectedCompany.name}!`
                                        : 'Tente ajustar os filtros para ver outras estratégias.'
                                    }
                                </p>
                                {strategies.length === 0 && (
                                    <Button
                                        onClick={() => setFormOpen(true)}
                                        className="gap-2 gradient-primary"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Criar Primeira Estratégia
                                    </Button>
                                )}
                            </div>
                        ) : viewMode === 'calendar' ? (
                            <CampaignCalendar
                                strategies={filteredStrategies}
                                campaigns={campaigns}
                                creators={creators}
                                onStrategyClick={handleEditStrategy}
                                onDateClick={(date) => {
                                    // Open form with pre-filled date
                                    setEditingStrategy(null);
                                    setFormOpen(true);
                                }}
                                onStrategyDrop={async (strategyId, newDate) => {
                                    // Update strategy start_date
                                    try {
                                        await updateStrategy.mutateAsync({
                                            id: strategyId,
                                            startDate: new Date(newDate),
                                        } as any);
                                        toast({
                                            title: 'Data atualizada!',
                                            description: 'A estratégia foi reagendada.',
                                        });
                                    } catch (error) {
                                        toast({
                                            title: 'Erro',
                                            description: 'Não foi possível atualizar a data.',
                                            variant: 'destructive',
                                        });
                                    }
                                }}
                            />
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
                    <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-4xl">🏢</span>
                        </div>
                        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                            Nenhuma empresa cadastrada
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Cadastre sua primeira empresa para começar o planejamento de marketing.
                        </p>
                        <Button
                            onClick={handleNewCompany}
                            className="gap-2 gradient-primary"
                        >
                            <Plus className="w-4 h-4" />
                            Cadastrar Primeira Empresa
                        </Button>
                    </div>
                )}
            </main>

            {
                selectedCompany && (
                    <>
                        <StrategyForm
                            open={formOpen}
                            onClose={handleCloseForm}
                            onSave={handleSaveStrategy}
                            editingStrategy={editingStrategy}
                            existingStrategies={strategies}
                            companyId={selectedCompany.id}
                            campaigns={campaigns}
                            defaultCampaignId={activeCampaign?.id || null}
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
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default MarketingPlanner;

