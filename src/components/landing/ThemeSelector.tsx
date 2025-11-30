import { LandingTheme, LAYOUT_PRESETS, LayoutType } from "@/types/landingTheme";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface ThemeSelectorProps {
    currentLayout: LayoutType;
    onSelectTheme: (layout: LayoutType) => void;
}

const THEME_PREVIEWS = {
    minimal: {
        name: "Minimalist",
        description: "Clean and professional",
        gradient: "from-gray-900 to-gray-700",
    },
    bold: {
        name: "Poder Feminino",
        description: "Intense and energetic",
        gradient: "from-pink-600 to-purple-700",
    },
    rock: {
        name: "Rock",
        description: "Fire and intensity",
        gradient: "from-orange-600 to-red-800",
    },
    elegant: {
        name: "Elegant / Soft",
        description: "Sophisticated luxury",
        gradient: "from-amber-600 to-amber-800",
    },
    gaming: {
        name: "Tech / Gaming",
        description: "Modern and futuristic",
        gradient: "from-green-500 to-emerald-600",
    },
    lifestyle: {
        name: "Lifestyle",
        description: "Soft and welcoming",
        gradient: "from-pink-400 to-blue-400",
    },
};

export function ThemeSelector({ currentLayout, onSelectTheme }: ThemeSelectorProps) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold mb-2">Escolha um Layout</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Selecione um tema base para sua landing page
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {Object.entries(THEME_PREVIEWS).map(([key, theme]) => {
                    const isSelected = currentLayout === key;
                    return (
                        <Card
                            key={key}
                            className={`cursor-pointer transition-all hover:scale-105 overflow-hidden ${isSelected ? "ring-2 ring-accent" : ""
                                }`}
                            onClick={() => onSelectTheme(key as LayoutType)}
                        >
                            <div className={`h-20 bg-gradient-to-br ${theme.gradient} relative`}>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                                        <Check className="w-4 h-4 text-accent" />
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <div className="font-semibold text-sm">{theme.name}</div>
                                <div className="text-xs text-muted-foreground">{theme.description}</div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
