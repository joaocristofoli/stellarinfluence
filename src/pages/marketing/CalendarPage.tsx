import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Download, Maximize2, Settings, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampaignCalendar } from '@/components/marketing/CampaignCalendar';
import { useCompanies } from '@/hooks/useCompanies';
import { useStrategies, useUpdateStrategy } from '@/hooks/useStrategies';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useFlyerEventsByCompany } from '@/hooks/useFlyers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChannelType } from '@/types/marketing';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';

/**
 * CalendarPage - Página Dedicada do Calendário
 * 
 * Rota: /admin/calendar/:companyId
 * 
 * Features:
 * - Visualização em tela cheia
 * - Link compartilhável
 * - Acesso direto ao calendário sem menu lateral
 */
export default function CalendarPage() {
    const { companyId } = useParams<{ companyId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [creators, setCreators] = useState<{ id: string; name: string; image_url?: string }[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Queries
    const { data: companies = [] } = useCompanies();
    const { data: strategies = [] } = useStrategies(companyId || null);
    const { data: campaigns = [] } = useCampaigns(companyId || null);
    const { data: flyerEvents = [] } = useFlyerEventsByCompany(companyId || null);

    // Mutations
    const updateStrategy = useUpdateStrategy();

    // Find selected company
    const selectedCompany = companies.find(c => c.id === companyId);

    // Fetch creators
    useEffect(() => {
        const fetchCreators = async () => {
            const { data } = await supabase
                .from('creators')
                .select('id, name, image_url');
            if (data) setCreators(data);
        };
        fetchCreators();
    }, []);

    // Handle strategy drop (drag & drop)
    const handleStrategyDrop = async (strategyId: string, newDateStr: string) => {
        if (!companyId) return;
        try {
            await updateStrategy.mutateAsync({
                id: strategyId,
                companyId: companyId,
                startDate: new Date(newDateStr),
            });
            toast({
                title: "Estratégia reagendada",
                description: `Movida para ${new Date(newDateStr).toLocaleDateString('pt-BR')}`,
            });
        } catch (error) {
            toast({
                title: "Erro ao mover",
                description: "Não foi possível reagendar a estratégia",
                variant: "destructive",
            });
        }
    };

    // Handle strategy click
    const handleStrategyClick = (strategy: any) => {
        navigate(`/admin/marketing?company=${companyId}&strategy=${strategy.id}`);
    };

    // Handle date click
    const handleDateClick = (date: Date) => {
        navigate(`/admin/marketing?company=${companyId}&date=${date.toISOString()}&new=true`);
    };

    // Share link
    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast({
            title: "Link copiado!",
            description: "O link do calendário foi copiado para a área de transferência",
        });
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Redirect if no company
    if (!companyId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <CalendarIcon className="w-16 h-16 mx-auto text-muted-foreground" />
                    <h1 className="text-2xl font-bold">Selecione uma empresa</h1>
                    <p className="text-muted-foreground">
                        Acesse o calendário através do Planejador de Marketing
                    </p>
                    <Button onClick={() => navigate('/admin/marketing')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Ir para Marketing
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "min-h-screen bg-background",
            isFullscreen && "p-4"
        )}>
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
                <div className="flex items-center justify-between max-w-[1800px] mx-auto">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/admin/marketing')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                        <div className="h-6 w-px bg-border" />
                        <div>
                            <h1 className="font-display text-lg font-bold flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                                Calendário de Marketing
                            </h1>
                            {selectedCompany && (
                                <p className="text-sm text-muted-foreground">
                                    {selectedCompany.name} • {strategies.length} estratégias
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShare}
                            className="gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            Compartilhar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleFullscreen}
                            className="gap-2"
                        >
                            <Maximize2 className="w-4 h-4" />
                            {isFullscreen ? 'Sair Tela Cheia' : 'Tela Cheia'}
                        </Button>
                        <Link to={`/admin/marketing?company=${companyId}`}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Settings className="w-4 h-4" />
                                Gerenciar
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Calendar */}
            <main className="p-4 max-w-[1800px] mx-auto">
                <CampaignCalendar
                    strategies={strategies}
                    campaigns={campaigns}
                    flyerEvents={flyerEvents}
                    creators={creators}
                    companyId={companyId}
                    showCosts={true}
                    onStrategyClick={handleStrategyClick}
                    onDateClick={handleDateClick}
                    onStrategyDrop={handleStrategyDrop}
                    onFlyerEventClick={(event) => {
                        toast({
                            title: `Panfletagem: ${event.location}`,
                            description: `${event.numPeople} pessoas • ${formatCurrency(event.dayCost)}`,
                        });
                    }}
                />
            </main>

            {/* Help Tips */}
            <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent p-4 pointer-events-none">
                <div className="max-w-[1800px] mx-auto flex justify-center gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Clique</kbd>
                        no evento para editar
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Arraste</kbd>
                        para reagendar
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">+</kbd>
                        para criar nova ação
                    </span>
                </div>
            </footer>
        </div>
    );
}
