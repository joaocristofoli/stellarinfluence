import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BannerLayer } from './types';
import { PropertyPanel } from './PropertyPanel';
import { Button } from "@/components/ui/button";
import { GripVertical, Eye, EyeOff, Lock, Unlock, Type, Image as ImageIcon, Box, Trash2, Edit2, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayerManagerProps {
    layers: BannerLayer[];
    selectedLayerId: string | null;
    onReorder: (layers: BannerLayer[]) => void;
    onSelect: (id: string) => void;
    onToggleVisibility: (id: string) => void;
    onToggleLock: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<BannerLayer['style'] | { content: string }>) => void;
}

function SortableLayerItem({ layer, isSelected, onSelect, onToggleVisibility, onToggleLock, onDelete, onUpdate }: {
    layer: BannerLayer;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onToggleVisibility: (id: string) => void;
    onToggleLock: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<BannerLayer['style'] | { content: string }>) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: layer.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const Icon = layer.type === 'text' ? Type : layer.type === 'image' ? ImageIcon : Box;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "rounded-md border bg-card mb-2 group transition-colors",
                isSelected ? "border-primary bg-primary/5" : "hover:bg-accent/50",
                !layer.visible && "opacity-50"
            )}
        >
            <div
                className="flex items-center gap-2 p-2 cursor-pointer"
                onClick={() => onSelect(layer.id)}
            >
                {/* Drag Handle */}
                <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground p-1">
                    <GripVertical className="w-4 h-4" />
                </div>

                {/* Icon */}
                <Icon className="w-4 h-4 text-muted-foreground" />

                {/* Name */}
                <span className="flex-1 text-sm truncate font-medium select-none">
                    {layer.name}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleLock(layer.id);
                        }}
                    >
                        {layer.locked ? <Lock className="w-3 h-3 text-destructive" /> : <Unlock className="w-3 h-3 text-muted-foreground" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility(layer.id);
                        }}
                    >
                        {layer.visible ? <Eye className="w-3 h-3 text-muted-foreground" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(layer.id); // Toggle selection
                        }}
                    >
                        <Edit2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-destructive/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(layer.id);
                        }}
                    >
                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                </div>
            </div>

            {/* Expanded Property Panel */}
            {isSelected && (
                <div className="p-4 border-t bg-card/50 cursor-default relative" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => onSelect(layer.id)} // Toggle off
                    >
                        <ChevronUp className="w-4 h-4" />
                    </Button>
                    <PropertyPanel layer={layer} onUpdate={onUpdate} />
                </div>
            )}
        </div>
    );
}

export function LayerManager({
    layers,
    selectedLayerId,
    onReorder,
    onSelect,
    onToggleVisibility,
    onToggleLock,
    onDelete,
    onUpdate
}: LayerManagerProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = layers.findIndex((l) => l.id === active.id);
            const newIndex = layers.findIndex((l) => l.id === over.id);

            onReorder(arrayMove(layers, oldIndex, newIndex));
        }
    };

    // We reverse the layers for the list so the top layer (highest z-index) is at the top of the list
    // But for drag and drop logic, we need to be careful. 
    // Usually "Top of list" = "Highest Z-Index" (Front).
    // In CSS, DOM order determines Z-Index (last element is on top).
    // So if layers[0] is rendered first, it's at the back. layers[length-1] is at the front.
    // So the list should display layers in REVERSE order (Front to Back).

    // However, dnd-kit works best with the actual array. 
    // Let's render the list in reverse order visually, but handle the array logic carefully.
    // Actually, simpler: Let's keep the array order as [Back, ..., Front].
    // And render the list as [Front, ..., Back].
    // But dnd-kit expects the items to match the SortableContext items.

    // Strategy: We will manage the array as [Front, ..., Back] (Highest Z to Lowest Z).
    // This means layers[0] is the TOPMOST element.
    // When rendering the canvas, we need to reverse it: layers.slice().reverse().map(...)
    // This way, the list order matches the visual stacking order (Top item in list = Top item on canvas).

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={layers.map(l => l.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-1">
                    {layers.map((layer) => (
                        <SortableLayerItem
                            key={layer.id}
                            layer={layer}
                            isSelected={layer.id === selectedLayerId}
                            onSelect={onSelect}
                            onToggleVisibility={onToggleVisibility}
                            onToggleLock={onToggleLock}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
