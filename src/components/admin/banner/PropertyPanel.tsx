import { BannerLayer } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlignLeft, AlignCenter, AlignRight, Type, Image as ImageIcon, Layout, Bold, Italic, Underline, CaseUpper, CaseLower, CaseSensitive } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface PropertyPanelProps {
    layer: BannerLayer | null;
    onUpdate: (id: string, updates: Partial<BannerLayer['style'] | { content: string }>) => void;
}

export function PropertyPanel({ layer, onUpdate }: PropertyPanelProps) {
    if (!layer) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                <Layout className="w-12 h-12 mb-4 opacity-20" />
                <p>Selecione uma camada para editar</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b">
                {layer.type === 'text' ? <Type className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                <h3 className="font-semibold text-sm">{layer.name}</h3>
            </div>

            <Tabs defaultValue="style" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="style">Estilo</TabsTrigger>
                    <TabsTrigger value="position">Posição</TabsTrigger>
                </TabsList>

                <TabsContent value="style" className="space-y-4 pt-4">
                    {/* Content Editor */}
                    {layer.type === 'text' && (
                        <div className="space-y-2">
                            <Label>Texto</Label>
                            <Textarea
                                value={layer.content}
                                onChange={(e) => onUpdate(layer.id, { content: e.target.value })}
                                className="min-h-[80px]"
                            />
                        </div>
                    )}

                    {/* Text Specific Styles */}
                    {layer.type === 'text' && (
                        <>
                            <div className="space-y-2">
                                <Label>Fonte</Label>
                                <Select
                                    value={layer.style.fontFamily}
                                    onValueChange={(v) => onUpdate(layer.id, { fontFamily: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Inter">Inter</SelectItem>
                                        <SelectItem value="Outfit">Outfit</SelectItem>
                                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                                        <SelectItem value="Arial">Arial</SelectItem>
                                        <SelectItem value="Impact">Impact</SelectItem>
                                        <SelectItem value="Georgia">Georgia</SelectItem>
                                        <SelectItem value="Times New Roman">Times</SelectItem>
                                        <SelectItem value="Courier New">Courier</SelectItem>
                                        <SelectItem value="Verdana">Verdana</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tamanho ({layer.style.fontSize}px)</Label>
                                    <input
                                        type="range"
                                        min="12"
                                        max="300"
                                        value={layer.style.fontSize}
                                        onChange={(e) => onUpdate(layer.id, { fontSize: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cor</Label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={layer.style.color}
                                            onChange={(e) => onUpdate(layer.id, { color: e.target.value })}
                                            className="h-9 w-full cursor-pointer rounded-md border border-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Alinhamento</Label>
                                <ToggleGroup
                                    type="single"
                                    value={layer.style.textAlign}
                                    onValueChange={(v: any) => v && onUpdate(layer.id, { textAlign: v })}
                                    className="justify-start"
                                >
                                    <ToggleGroupItem value="left"><AlignLeft className="w-4 h-4" /></ToggleGroupItem>
                                    <ToggleGroupItem value="center"><AlignCenter className="w-4 h-4" /></ToggleGroupItem>
                                    <ToggleGroupItem value="right"><AlignRight className="w-4 h-4" /></ToggleGroupItem>
                                </ToggleGroup>
                            </div>

                            {/* Advanced Text Effects */}
                            <div className="space-y-4 border-t pt-4">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">Efeitos Avançados</Label>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Espaçamento</Label>
                                        <input
                                            type="range"
                                            min="-5"
                                            max="20"
                                            value={layer.style.letterSpacing || 0}
                                            onChange={(e) => onUpdate(layer.id, { letterSpacing: parseInt(e.target.value) })}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Altura da Linha</Label>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="3"
                                            step="0.1"
                                            value={layer.style.lineHeight || 1.2}
                                            onChange={(e) => onUpdate(layer.id, { lineHeight: parseFloat(e.target.value) })}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Transformação</Label>
                                    <ToggleGroup
                                        type="single"
                                        value={layer.style.textTransform || 'none'}
                                        onValueChange={(v: any) => v && onUpdate(layer.id, { textTransform: v })}
                                        className="justify-start"
                                    >
                                        <ToggleGroupItem value="none"><CaseSensitive className="w-4 h-4" /></ToggleGroupItem>
                                        <ToggleGroupItem value="uppercase"><CaseUpper className="w-4 h-4" /></ToggleGroupItem>
                                        <ToggleGroupItem value="lowercase"><CaseLower className="w-4 h-4" /></ToggleGroupItem>
                                    </ToggleGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label>Estilo</Label>
                                    <ToggleGroup
                                        type="single"
                                        value={layer.style.fontStyle || 'normal'}
                                        onValueChange={(v: any) => v && onUpdate(layer.id, { fontStyle: v })}
                                        className="justify-start"
                                    >
                                        <ToggleGroupItem value="normal"><Type className="w-4 h-4" /></ToggleGroupItem>
                                        <ToggleGroupItem value="italic"><Italic className="w-4 h-4" /></ToggleGroupItem>
                                    </ToggleGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label>Sombra</Label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="checkbox"
                                            checked={!!layer.style.textShadow}
                                            onChange={(e) => onUpdate(layer.id, { textShadow: e.target.checked ? '2px 2px 4px rgba(0,0,0,0.5)' : undefined })}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-sm text-muted-foreground">Ativar Sombra</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Contorno (Stroke)</Label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="checkbox"
                                            checked={!!layer.style.stroke}
                                            onChange={(e) => onUpdate(layer.id, { stroke: e.target.checked ? '1px black' : undefined })}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-sm text-muted-foreground">Ativar Contorno</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Image Specific Styles */}
                    {layer.type === 'image' && (
                        <>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Arredondamento</Label>
                                    <span className="text-xs text-muted-foreground">{layer.style.borderRadius}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="500"
                                    value={layer.style.borderRadius || 0}
                                    onChange={(e) => onUpdate(layer.id, { borderRadius: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Opacidade</Label>
                                    <span className="text-xs text-muted-foreground">{Math.round((layer.style.opacity || 1) * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={layer.style.opacity ?? 1}
                                    onChange={(e) => onUpdate(layer.id, { opacity: parseFloat(e.target.value) })}
                                    className="w-full"
                                />
                            </div>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="position" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Posição X</Label>
                            <Input
                                type="number"
                                value={Math.round(layer.style.x)}
                                onChange={(e) => onUpdate(layer.id, { x: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Posição Y</Label>
                            <Input
                                type="number"
                                value={Math.round(layer.style.y)}
                                onChange={(e) => onUpdate(layer.id, { y: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Largura</Label>
                            <Input
                                type="number"
                                value={Math.round(layer.style.width || 0)}
                                onChange={(e) => onUpdate(layer.id, { width: parseInt(e.target.value) })}
                                disabled={layer.type === 'text'} // Text width is auto
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Altura</Label>
                            <Input
                                type="number"
                                value={Math.round(layer.style.height || 0)}
                                onChange={(e) => onUpdate(layer.id, { height: parseInt(e.target.value) })}
                                disabled={layer.type === 'text'}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Rotação ({Math.round(layer.style.rotation || 0)}°)</Label>
                        <input
                            type="range"
                            min="-180"
                            max="180"
                            value={layer.style.rotation || 0}
                            onChange={(e) => onUpdate(layer.id, { rotation: parseInt(e.target.value) })}
                            className="w-full"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
