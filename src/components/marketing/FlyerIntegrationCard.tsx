import { CalendarDays, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useFlyerCampaigns, useFlyerEvents } from '@/hooks/useFlyers';
import { calculateCampaignStats } from '@/utils/calendarHelpers';
import { formatCurrency } from '@/utils/formatters';

interface FlyerIntegrationCardProps {
    companyId: string;
}

export function FlyerIntegrationCard({ companyId }: FlyerIntegrationCardProps) {
    const { data: campaigns = [] } = useFlyerCampaigns(companyId);

    // Get first campaign for preview (or null if none)
    const campaign = campaigns[0] || null;

    // Always call hooks unconditionally - pass empty string if no campaign
    const { data: events = [] } = useFlyerEvents(campaign?.id || '');
    const stats = calculateCampaignStats(events);

    // Now we can do conditional renders
    if (!campaign) {
        return (
            <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-semibold">Panfletagem</h3>
                    </div>
                    <Link to="/admin/flyers">
                        <Button size="sm" variant="outline">
                            Gerenciar
                        </Button>
                    </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                    Nenhuma campanha de panfletagem criada ainda.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" style={{ color: campaign.color }} />
                    <h3 className="font-semibold">Panfletagem</h3>
                </div>
                <Link to="/admin/flyers">
                    <Button size="sm" variant="outline">
                        Ver Calendário
                    </Button>
                </Link>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Campanha:</span>
                    <span className="font-medium" style={{ color: campaign.color }}>
                        {campaign.name}
                    </span>
                </div>
                {events.length > 0 && (
                    <>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Eventos:</span>
                            <span className="font-medium">{events.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground gap-1 flex items-center">
                                <TrendingUp className="w-3 h-3" />
                                Investimento:
                            </span>
                            <span className="font-bold" style={{ color: campaign.color }}>
                                {formatCurrency(stats.totalCost)}
                            </span>
                        </div>
                    </>
                )}
                {campaigns.length > 1 && (
                    <p className="text-xs text-muted-foreground italic mt-2">
                        + {campaigns.length - 1} {campaigns.length - 1 === 1 ? 'campanha' : 'campanhas'}
                    </p>
                )}
            </div>
        </div>
    );
}
