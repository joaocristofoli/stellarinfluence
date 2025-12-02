import { LandingTheme, LAYOUT_PRESETS, LayoutType } from "@/types/landingTheme";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface ThemeSelectorProps {
    currentLayout: LayoutType;
    onSelectTheme: (layout: LayoutType) => void;
}

const THEME_PREVIEWS = {
    minimal: {
        name: "Ethereal (Premium)",
        description: "Breathing gradients & noise",
        gradient: "from-gray-900 to-gray-700",
    },
    bold: {
        name: "Vortex (Premium)",
        description: "High-contrast spiral physics",
        gradient: "from-pink-600 to-purple-700",
    },
    rock: {
        name: "Inferno (Premium)",
        description: "Heat distortion & embers",
        gradient: "from-orange-600 to-red-800",
    },
    elegant: {
        name: "Silk (Premium)",
        description: "Flowing golden lines",
        gradient: "from-amber-600 to-amber-800",
    },
    gaming: {
        name: "Cyber Grid (Premium)",
        description: "3D perspective & rain",
        gradient: "from-green-500 to-emerald-600",
    },
    lifestyle: {
        name: "Bloom (Premium)",
        description: "Watercolor mixing",
        gradient: "from-pink-400 to-blue-400",
    },
    magnetic: {
        name: "Magnetic (Premium)",
        description: "Interactive physics & depth",
        gradient: "from-blue-600 to-violet-600",
    },
    liquid: {
        name: "Liquid (Premium)",
        description: "Morphing blobs & glass",
        gradient: "from-pink-500 to-cyan-500",
    },
    cosmic: {
        name: "Cosmic (Premium)",
        description: "Interactive starfield",
        gradient: "from-purple-600 to-indigo-900",
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
