import { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LandingTheme } from "@/types/landingTheme";
import { SortableSectionItem } from "./SortableSectionItem";

interface SectionManagerProps {
    theme: LandingTheme;
    onUpdateTheme: (theme: LandingTheme) => void;
    onEditSection?: (sectionKey: string) => void;
}

const SECTION_NAMES: Record<string, string> = {
    hero: "Hero / Banner Principal",
    about: "Sobre Mim",
    stats: "Estatísticas",
    gallery: "Galeria de Fotos/Vídeos",
    social: "Redes Sociais",
    contact: "Contato / Formulário",
    cta: "Botão 'Vamos Trabalhar Juntos'",
};

export function SectionManager({ theme, onUpdateTheme, onEditSection }: SectionManagerProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Get sections as array sorted by order
    const sectionsArray = Object.entries(theme.sections)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([key, section]) => ({ key, ...section }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = sectionsArray.findIndex((s) => s.key === active.id);
            const newIndex = sectionsArray.findIndex((s) => s.key === over.id);

            const newArray = arrayMove(sectionsArray, oldIndex, newIndex);

            // Update orders
            const newSections = { ...theme.sections };
            newArray.forEach((section, index) => {
                newSections[section.key as keyof typeof newSections].order = index + 1;
            });

            onUpdateTheme({
                ...theme,
                sections: newSections,
            });
        }
    };

    const handleToggleSection = (key: string) => {
        const newSections = { ...theme.sections };
        newSections[key as keyof typeof newSections].enabled =
            !newSections[key as keyof typeof newSections].enabled;

        onUpdateTheme({
            ...theme,
            sections: newSections,
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold mb-2">Gerenciar Seções</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Arraste para reordenar, ative/desative e edite o conteúdo
                </p>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={sectionsArray.map((s) => s.key)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {sectionsArray.map((section) => (
                            <SortableSectionItem
                                key={section.key}
                                id={section.key}
                                title={SECTION_NAMES[section.key] || section.key}
                                enabled={section.enabled}
                                onToggle={() => handleToggleSection(section.key)}
                                onEdit={() => onEditSection?.(section.key)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
