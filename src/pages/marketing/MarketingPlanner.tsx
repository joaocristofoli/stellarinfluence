import { useState, useEffect } from 'react';
import { Plus, Loader2, FileDown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { StrategyCard } from '@/components/marketing/StrategyCard';
import { StrategyForm } from '@/components/marketing/StrategyForm';
import { ChannelFilter } from '@/components/marketing/ChannelFilter';
import { StatsOverview } from '@/components/marketing/StatsOverview';
import { CompanySelector } from '@/components/marketing/CompanySelector';
import { CompanyForm } from '@/components/marketing/CompanyForm';
import { MarketingStrategy, ChannelType, Company } from '@/types/marketing';
import { exportToPdf } from '@/utils/exportPdf';
import { useToast } from '@/hooks/use-toast';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompanies';
import { useStrategies, useCreateStrategy, useUpdateStrategy, useDeleteStrategy } from '@/hooks/useStrategies';

const MarketingPlanner = () => {
    const { toast } = useToast();
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [companyFormOpen, setCompanyFormOpen] = useState(false);
    const [editingCompanyMode, setEditingCompanyMode] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState<MarketingStrategy | null>(null);
    const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>([]);

    // Queries
    const { data: companies = [], isLoading: loadingCompanies } = useCompanies();
    const { data: strategies = [], isLoading: loadingStrategies } = useStrategies(selectedCompany?.id || null);

    // Mutations
    const createCompany = useCreateCompany();
    const updateCompany = useUpdateCompany();
    const deleteCompany = useDeleteCompany();
    const createStrategy = useCreateStrategy();
    const updateStrategy = useUpdateStrategy();
    const deleteStrategy = useDeleteStrategy();

    // Auto-select first company
    useEffect(() => {
        if (companies.length > 0 && !selectedCompany) {
            setSelectedCompany(companies[0]);
        }
    }, [companies, selectedCompany]);

    const totalBudget = strategies.reduce((sum, s) => sum + s.budget, 0);

    const filteredStrategies = selectedChannels.length > 0
        ? strategies.filter(s => selectedChannels.includes(s.channelType))
        : strategies;

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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    if (loadingCompanies) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
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
                                <h1 className="font-display font-bold text-xl">📋 Planejamento de Marketing</h1>
                                {selectedCompany && (
                                    <p className="text-sm text-muted-foreground">
                                        {selectedCompany.name} • {strategies.length} estratégias • {formatCurrency(totalBudget)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button onClick={handleExport} variant="outline" className="gap-2">
                            <FileDown className="w-4 h-4" />
                            Exportar PDF
                        </Button>
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
                        <StatsOverview strategies={strategies} />

                        <ChannelFilter
                            selectedChannels={selectedChannels}
                            onToggleChannel={handleToggleChannel}
                            onClearFilters={handleClearFilters}
                        />

                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-2xl font-bold text-foreground">
                                Estratégias de Marketing
                            </h2>
                            <Button
                                onClick={() => setFormOpen(true)}
                                className="gap-2 gradient-primary shadow-glow hover:opacity-90 transition-opacity"
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

            {selectedCompany && (
                <StrategyForm
                    open={formOpen}
                    onClose={handleCloseForm}
                    onSave={handleSaveStrategy}
                    editingStrategy={editingStrategy}
                    existingStrategies={strategies}
                    companyId={selectedCompany.id}
                />
            )}

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
        </div>
    );
};

export default MarketingPlanner;
