import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const FONT_OPTIONS = [
    { value: 'Inter', label: 'Inter (Modern Sans)', category: 'sans-serif' },
    { value: 'Roboto', label: 'Roboto (Neutral)', category: 'sans-serif' },
    { value: 'Poppins', label: 'Poppins (Geometric)', category: 'sans-serif' },
    { value: 'Playfair Display', label: 'Playfair Display (Elegant)', category: 'serif' },
    { value: 'Merriweather', label: 'Merriweather (Classic)', category: 'serif' },
    { value: 'Montserrat', label: 'Montserrat (Bold)', category: 'sans-serif' },
    { value: 'Open Sans', label: 'Open Sans (Friendly)', category: 'sans-serif' },
    { value: 'Lato', label: 'Lato (Clean)', category: 'sans-serif' },
    { value: 'Oswald', label: 'Oswald (Condensed)', category: 'sans-serif' },
    { value: 'Quicksand', label: 'Quicksand (Rounded)', category: 'sans-serif' },
    { value: 'Rajdhani', label: 'Rajdhani (Tech)', category: 'sans-serif' },
];

interface FontSelectorProps {
    value: string;
    onChange: (font: string) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
    return (
        <div className="space-y-2">
            <Label>Fonte Principal</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma fonte" />
                </SelectTrigger>
                <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value} className="cursor-pointer">
                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
                Esta fonte será aplicada em todos os textos da sua página.
            </p>
        </div>
    );
}
