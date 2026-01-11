import { Button } from '@/components/ui/button';
import { ChannelType, channelTypeLabels, channelTypeIcons } from '@/types/marketing';
import { X } from 'lucide-react';

interface ChannelFilterProps {
    selectedChannels: ChannelType[];
    onToggleChannel: (channel: ChannelType) => void;
    onClearFilters: () => void;
}

const channelTypes: ChannelType[] = [
    'influencer',
    'paid_traffic',
    'flyers',
    'physical_media',
    'events',
    'partnerships',
    'social_media',
    'email_marketing',
    'radio',
    'sound_car',
    'promoters',
];

export function ChannelFilter({ selectedChannels, onToggleChannel, onClearFilters }: ChannelFilterProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Filtrar por canal</h3>
                {selectedChannels.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-7 text-xs">
                        <X className="w-3 h-3 mr-1" />
                        Limpar filtros
                    </Button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {channelTypes.map(channel => (
                    <Button
                        key={channel}
                        variant={selectedChannels.includes(channel) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onToggleChannel(channel)}
                        className="text-xs h-8"
                    >
                        {channelTypeIcons[channel]} {channelTypeLabels[channel]}
                    </Button>
                ))}
            </div>
        </div>
    );
}
