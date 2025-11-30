import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
    label: string;
    color: string;
    onChange: (color: string) => void;
    presets?: string[];
}

const DEFAULT_PRESETS = [
    "#FF6B35", "#004E89", "#FF0080", "#8000FF",
    "#00FF88", "#FF0044", "#C9A961", "#2C2C2C",
    "#FF9B9B", "#A8D8EA", "#000000", "#FFFFFF",
];

export function ColorPicker({ label, color, onChange, presets = DEFAULT_PRESETS }: ColorPickerProps) {
    return (
        <div className="space-y-3">
            <Label>{label}</Label>

            {/* Color Input */}
            <div className="flex gap-2">
                <div
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => document.getElementById(`color-input-${label}`)?.click()}
                />
                <div className="flex-1 space-y-2">
                    <Input
                        type="text"
                        value={color}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#000000"
                        className="font-mono text-sm"
                    />
                    <input
                        id={`color-input-${label}`}
                        type="color"
                        value={color}
                        onChange={(e) => onChange(e.target.value)}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-6 gap-2">
                {presets.map((presetColor) => (
                    <button
                        key={presetColor}
                        type="button"
                        className={`w-full aspect-square rounded-md border-2 transition-all hover:scale-110 ${color === presetColor ? "border-accent ring-2 ring-accent/50" : "border-border"
                            }`}
                        style={{ backgroundColor: presetColor }}
                        onClick={() => onChange(presetColor)}
                        title={presetColor}
                    />
                ))}
            </div>
        </div>
    );
}
