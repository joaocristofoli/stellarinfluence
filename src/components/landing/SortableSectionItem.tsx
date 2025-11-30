import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface SortableSectionItemProps {
    id: string;
    title: string;
    enabled: boolean;
    onToggle: () => void;
    onEdit: () => void;
}

export function SortableSectionItem({
    id,
    title,
    enabled,
    onToggle,
    onEdit,
}: SortableSectionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`p-4 bg-card cursor-default ${isDragging ? "shadow-lg" : ""}`}
        >
            <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing touch-none"
                >
                    <GripVertical className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>

                {/* Section Title */}
                <div className="flex-1">
                    <Label className={!enabled ? "text-muted-foreground" : ""}>{title}</Label>
                </div>

                {/* Enabled Toggle */}
                <div className="flex items-center gap-2">
                    <Switch checked={enabled} onCheckedChange={onToggle} />
                    {enabled ? (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                    ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                </div>

                {/* Edit Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    disabled={!enabled}
                >
                    Editar
                </Button>
            </div>
        </Card>
    );
}
