import { ChevronDown, Plus, Settings, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MarketingCampaign } from '@/types/marketing';

interface CampaignSelectorProps {
    campaigns: MarketingCampaign[];
    selectedCampaign: MarketingCampaign | null | 'all' | 'none';
    onSelectCampaign: (campaign: MarketingCampaign | 'all' | 'none') => void;
    onNewCampaign: () => void;
    onEditCampaign: () => void;
    disabled?: boolean;
}

const statusLabels = {
    planned: '📋 Planejada',
    in_progress: '🚀 Em Andamento',
    completed: '✅ Concluída',
};

export function CampaignSelector({
    campaigns,
    selectedCampaign,
    onSelectCampaign,
    onNewCampaign,
    onEditCampaign,
    disabled,
}: CampaignSelectorProps) {
    const getDisplayText = () => {
        if (selectedCampaign === 'all') return 'Todas as Campanhas';
        if (selectedCampaign === 'none') return 'Sem Campanha';
        if (selectedCampaign) return selectedCampaign.name;
        return 'Selecione uma campanha';
    };

    const isActualCampaign = selectedCampaign !== 'all' && selectedCampaign !== 'none' && selectedCampaign !== null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 min-w-[200px] justify-between"
                    disabled={disabled}
                >
                    <div className="flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-purple-500" />
                        <span className="truncate">{getDisplayText()}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[280px]">
                <DropdownMenuItem
                    onClick={() => onSelectCampaign('all')}
                    className="cursor-pointer"
                >
                    <div>
                        <p className="font-medium">🌐 Todas as Campanhas</p>
                        <p className="text-xs text-muted-foreground">
                            Ver estratégias de todas as campanhas
                        </p>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => onSelectCampaign('none')}
                    className="cursor-pointer"
                >
                    <div>
                        <p className="font-medium">📂 Sem Campanha</p>
                        <p className="text-xs text-muted-foreground">
                            Estratégias não vinculadas a campanhas
                        </p>
                    </div>
                </DropdownMenuItem>

                {campaigns.length > 0 && <DropdownMenuSeparator />}

                {campaigns.map(campaign => (
                    <DropdownMenuItem
                        key={campaign.id}
                        onClick={() => onSelectCampaign(campaign)}
                        className="cursor-pointer"
                    >
                        <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {statusLabels[campaign.status]}
                            </p>
                        </div>
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onNewCampaign} className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Campanha
                </DropdownMenuItem>

                {isActualCampaign && (
                    <DropdownMenuItem onClick={onEditCampaign} className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Editar Campanha
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
