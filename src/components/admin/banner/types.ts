export type LayerType = 'text' | 'image' | 'shape';

export interface LayerStyle {
    x: number;
    y: number;
    width?: number;
    height?: number;
    // Text specific
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    textShadow?: string;
    stroke?: string;
    letterSpacing?: number;
    lineHeight?: number;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    fontStyle?: 'normal' | 'italic';
    fontWeight?: string;
    // General
    backgroundColor?: string;
    zIndex: number;
    rotation?: number;
    opacity?: number;
    borderRadius?: number;
    shadow?: string;
}

export interface BannerLayer {
    id: string;
    type: LayerType;
    name: string;
    content: string; // Text content or Image URL
    visible: boolean;
    locked: boolean;
    style: LayerStyle;
    // Metadata
    isLockedRatio?: boolean;
    isBackground?: boolean; // If true, cannot be moved/resized easily or at all
}
