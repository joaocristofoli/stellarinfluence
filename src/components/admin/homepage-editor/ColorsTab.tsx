import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HomepageConfig } from '@/types/homepageConfig';

interface ColorsTabProps {
    config: HomepageConfig;
    onConfigChange: (config: Partial<HomepageConfig>) => void;
}

/**
 * ColorsTab - Editor for homepage color palette
 * 
 * @description
 * Manages the color scheme for the homepage:
 * - Primary color (Orange)
 * - Secondary color (Purple)
 * - Accent color (Yellow)
 */
export function ColorsTab({ config, onConfigChange }: ColorsTabProps) {
    const handleChange = (field: keyof HomepageConfig, value: string) => {
        onConfigChange({ [field]: value });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-sm">Cor Primária (Laranja)</Label>
                <Input
                    type="color"
                    value={config.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="h-12 mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Usada no gradiente principal e destaques
                </p>
            </div>

            <div>
                <Label className="text-sm">Cor Secundária (Roxo)</Label>
                <Input
                    type="color"
                    value={config.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="h-12 mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Usada no gradiente e efeitos secundários
                </p>
            </div>

            <div>
                <Label className="text-sm">Cor de Acento (Amarelo)</Label>
                <Input
                    type="color"
                    value={config.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="h-12 mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Usada no gradiente do título "CRIADORES"
                </p>
            </div>
        </div>
    );
}

export default ColorsTab;
