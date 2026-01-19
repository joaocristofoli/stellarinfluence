import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, TrendingUp, CheckCircle2, Clock, Activity, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanies } from '@/hooks/useCompanies';
import { useStrategies } from '@/hooks/useStrategies';
import { ActivityTimeline } from '@/components/marketing/ActivityTimeline';
import { NotificationBell } from '@/components/NotificationBell';
import { channelTypeLabels, channelTypeIcons } from '@/types/marketing';
import { formatCurrency } from '@/utils/formatters';

export default function ProjectsDashboard() {
    const { data: companies = [], isLoading: loadingCompanies } = useCompanies();
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

    // Get strategies for selected company (or first company)
    const activeCompanyId = selectedCompanyId || companies[0]?.id || null;
    const { data: strategies = [] } = useStrategies(activeCompanyId);

    // Calculate global stats
    const totalBudget = strategies.reduce((sum, s) => sum + s.budget, 0);
    const plannedCount = strategies.filter(s => s.status === 'planned').length;
    const inProgressCount = strategies.filter(s => s.status === 'in_progress').length;
    const completedCount = strategies.filter(s => s.status === 'completed').length;

    const completionRate = strategies.length > 0
        ? Math.round((completedCount / strategies.length) * 100)
        : 0;

    // Channel distribution
    const channelStats = strategies.reduce((acc, s) => {
        if (!acc[s.channelType]) {
            acc[s.channelType] = { count: 0, budget: 0 };
        }
        acc[s.channelType].count++;
        acc[s.channelType].budget += s.budget;
        return acc;
    }, {} as Record<string, { count: number; budget: number }>);

    if (loadingCompanies) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Carregando...</div>
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
                                <h1 className="font-display font-bold text-xl">📊 Dashboard de Projetos</h1>
                                <p className="text-sm text-muted-foreground">
                                    Visão geral de todas as empresas e campanhas
                                </p>
                            </div>
                        </div>
                        <NotificationBell />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="companies">Por Empresa</TabsTrigger>
                        <TabsTrigger value="activity">Atividades</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{companies.length}</p>
                                            <p className="text-sm text-muted-foreground">Empresas</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                            <DollarSign className="w-6 h-6 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                                            <p className="text-sm text-muted-foreground">Orçamento Total</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{inProgressCount}</p>
                                            <p className="text-sm text-muted-foreground">Em Andamento</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{completedCount}</p>
                                            <p className="text-sm text-muted-foreground">Concluídas</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Progress & Channels */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Completion Rate */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        Taxa de Conclusão
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-end gap-4">
                                            <span className="text-5xl font-bold text-primary">{completionRate}%</span>
                                            <span className="text-muted-foreground mb-2">
                                                {completedCount} de {strategies.length} estratégias
                                            </span>
                                        </div>
                                        <Progress value={completionRate} className="h-3" />
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>📋 {plannedCount} planejadas</span>
                                            <span>⚡ {inProgressCount} em andamento</span>
                                            <span>✅ {completedCount} concluídas</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Channels Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Distribuição por Canal</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.entries(channelStats)
                                            .sort(([, a], [, b]) => b.budget - a.budget)
                                            .map(([channel, stats]) => (
                                                <div key={channel} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">
                                                            {channelTypeIcons[channel as keyof typeof channelTypeIcons]}
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {channelTypeLabels[channel as keyof typeof channelTypeLabels]}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-primary">{formatCurrency(stats.budget)}</p>
                                                        <p className="text-xs text-muted-foreground">{stats.count} estratégia(s)</p>
                                                    </div>
                                                </div>
                                            ))}
                                        {Object.keys(channelStats).length === 0 && (
                                            <p className="text-center text-muted-foreground py-4">
                                                Nenhuma estratégia cadastrada
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Companies Tab */}
                    <TabsContent value="companies" className="space-y-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {companies.map(company => (
                                <CompanyCard key={company.id} companyId={company.id} company={company} />
                            ))}
                        </div>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Atividades Recentes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ActivityTimeline limit={30} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

// Company Card Component
function CompanyCard({ companyId, company }: { companyId: string; company: any }) {
    const { data: strategies = [] } = useStrategies(companyId);

    const totalBudget = strategies.reduce((sum, s) => sum + s.budget, 0);
    const completedCount = strategies.filter(s => s.status === 'completed').length;
    const progress = strategies.length > 0
        ? Math.round((completedCount / strategies.length) * 100)
        : 0;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {company.logoUrl ? (
                            <img
                                src={company.logoUrl}
                                alt={company.name}
                                className="w-12 h-12 rounded-xl object-cover"
                            />
                        ) : (
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: company.primaryColor || '#8B2A9B' }}
                            >
                                {company.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold">{company.name}</h3>
                            {company.city && (
                                <p className="text-xs text-muted-foreground">
                                    {company.city}, {company.state}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estratégias</span>
                        <span className="font-medium">{strategies.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Orçamento</span>
                        <span className="font-medium text-primary">{formatCurrency(totalBudget)}</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </div>

                <Link to={`/admin/marketing?companyId=${companyId}`}>
                    <Button variant="outline" className="w-full mt-4" size="sm">
                        Ver Detalhes
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

// ... (rest of file)
