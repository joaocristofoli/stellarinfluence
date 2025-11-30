import { motion } from "framer-motion";
import { BannerLayer } from "./types";
import { cn } from "@/lib/utils";
import { Move, Maximize2 } from "lucide-react";

interface BannerLayerCanvasProps {
    layer: BannerLayer;
    isSelected: boolean;
    scaleFactor: number;
    onSelect: (id: string) => void;
    onUpdate: (id: string, updates: Partial<BannerLayer['style']>) => void;
}

export function BannerLayerCanvas({
    layer,
    isSelected,
    scaleFactor,
    onSelect,
    onUpdate
}: BannerLayerCanvasProps) {
    if (!layer.visible) return null;

    const handleDragEnd = (_: any, info: any) => {
        if (layer.locked) return;

        // Calculate new position based on drag offset and scale factor
        const newX = layer.style.x + (info.offset.x / scaleFactor);
        const newY = layer.style.y + (info.offset.y / scaleFactor);

        onUpdate(layer.id, { x: newX, y: newY });
    };

    return (
        <motion.div
            className={cn(
                "absolute cursor-move group",
                isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-transparent"
            )}
            style={{
                left: 0, // We use transform for positioning to avoid layout thrashing
                top: 0,
                x: layer.style.x,
                y: layer.style.y,
                zIndex: layer.style.zIndex,
                width: layer.style.width,
                height: layer.style.height,
                rotate: layer.style.rotation || 0,
                touchAction: "none" // Prevent scrolling on touch devices while dragging
            }}
            drag={!layer.locked}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(layer.id);
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            {/* Content Rendering */}
            {layer.type === 'text' && (
                <div
                    style={{
                        fontSize: layer.style.fontSize,
                        fontFamily: layer.style.fontFamily,
                        color: layer.style.color,
                        textAlign: layer.style.textAlign,
                        textShadow: layer.style.textShadow,
                        fontWeight: layer.style.fontWeight,
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.2
                    }}
                >
                    {layer.content}
                </div>
            )}

            {layer.type === 'image' && (
                <div
                    className="w-full h-full overflow-hidden"
                    style={{
                        borderRadius: layer.style.borderRadius,
                        opacity: layer.style.opacity,
                        boxShadow: layer.style.shadow
                    }}
                >
                    <img
                        src={layer.content}
                        alt={layer.name}
                        className="w-full h-full object-cover pointer-events-none" // pointer-events-none to prevent native drag
                        crossOrigin="anonymous"
                    />
                </div>
            )}

            {/* Selection Controls (Visible when selected) */}
            {isSelected && !layer.locked && (
                <>
                    {/* Resize Handle (Simple implementation for now) */}
                    {/* Note: Real resizing needs more complex logic, for now we rely on sidebar or simple scale */}
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full cursor-se-resize flex items-center justify-center shadow-md">
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </div>

                    {/* Move Indicator */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Drag to move
                    </div>
                </>
            )}
        </motion.div>
    );
}
