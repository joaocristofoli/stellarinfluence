import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HomepageConfig } from '@/types/homepageConfig';

interface TextsTabProps {
    config: HomepageConfig;
    onConfigChange: (config: Partial<HomepageConfig>) => void;
}

/**
 * TextsTab - Editor for homepage text content
 * 
 * @description
 * Manages all text-related fields for the homepage:
 * - Badge text
 * - Title lines (1, 2, 3)
 * - Subtitle
 * - CTA button texts
 */
export function TextsTab({ config, onConfigChange }: TextsTabProps) {
    const handleChange = (field: keyof HomepageConfig, value: string) => {
        onConfigChange({ [field]: value });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-sm">Badge (topo)</Label>
                <Input
                    value={config.hero_badge_text}
                    onChange={(e) => handleChange('hero_badge_text', e.target.value)}
                    placeholder="A Nova Era do Marketing Digital"
                    className="mt-1.5"
                />
            </div>

            <div>
                <Label className="text-sm">Título - Linha 1</Label>
                <Input
                    value={config.hero_title_line1}
                    onChange={(e) => handleChange('hero_title_line1', e.target.value)}
                    placeholder="CONECTAMOS"
                    className="mt-1.5"
                />
            </div>

            <div>
                <Label className="text-sm">Título - Linha 2 (Destaque)</Label>
                <Input
                    value={config.hero_title_line2}
                    onChange={(e) => handleChange('hero_title_line2', e.target.value)}
                    placeholder="CRIADORES"
                    className="mt-1.5"
                />
            </div>

            <div>
                <Label className="text-sm">Título - Linha 3</Label>
                <Input
                    value={config.hero_title_line3}
                    onChange={(e) => handleChange('hero_title_line3', e.target.value)}
                    placeholder="AO FUTURO"
                    className="mt-1.5"
                />
            </div>

            <div>
                <Label className="text-sm">Subtítulo</Label>
                <Textarea
                    value={config.hero_subtitle}
                    onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                    placeholder="Plataforma premium que transforma marcas em fenômenos digitais"
                    rows={2}
                    className="mt-1.5"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-sm">Botão Primário</Label>
                    <Input
                        value={config.cta_primary_text}
                        onChange={(e) => handleChange('cta_primary_text', e.target.value)}
                        placeholder="Começar Agora"
                        className="mt-1.5"
                    />
                </div>

                <div>
                    <Label className="text-sm">Botão Secundário</Label>
                    <Input
                        value={config.cta_secondary_text}
                        onChange={(e) => handleChange('cta_secondary_text', e.target.value)}
                        placeholder="Ver Criadores"
                        className="mt-1.5"
                    />
                </div>
            </div>
        </div>
    );
}

export default TextsTab;
