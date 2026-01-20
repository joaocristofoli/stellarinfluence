
import { Creator } from "@/types/creator";
import { StrategyDeliverable } from "@/types/marketing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Smartphone, Video, Image as ImageIcon, Film, Youtube, Music } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useEffect, useState, memo } from "react";

interface CreatorCartItemProps {
    creator: Creator;
    deliverable: StrategyDeliverable;
    onUpdate: (deliverable: StrategyDeliverable) => void;
    onRemove: () => void;
}

export function CreatorCartItem({ creator, deliverable, onUpdate, onRemove }: CreatorCartItemProps) {
    // Local state for price input to prevent cursor jumping
    const [priceInput, setPriceInput] = useState(deliverable.price.toString());

    // Update local state when prop changes externally (e.g. format switch auto-price)
    useEffect(() => {
        setPriceInput(deliverable.price.toString());
    }, [deliverable.price]);

    const handleFormatChange = (format: string) => {
        // Auto-price logic based on Admin Metadata
        let newPrice = 0;
        const formatKey = `price_${format}`;

        if (creator.admin_metadata && creator.admin_metadata[formatKey]) {
            // Parse "1.500" -> 1500 or "1500" -> 1500
            const raw = String(creator.admin_metadata[formatKey]);
            const priceString = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
            const parsed = parseFloat(priceString);
            if (!isNaN(parsed)) {
                newPrice = parsed;
            }
        }

        onUpdate({
            ...deliverable,
            format,
            price: newPrice > 0 ? newPrice : deliverable.price // Keep old price if 0 found
        });
    };

    const handlePriceChange = (val: string) => {
        setPriceInput(val);
        const num = parseFloat(val);
        if (!isNaN(num)) {
            onUpdate({ ...deliverable, price: num });
        }
    };

    const getFormatIcon = (fmt: string) => {
        switch (fmt) {
            case 'story': return <Smartphone className="w-3 h-3" />;
            case 'reels': return <Video className="w-3 h-3" />;
            case 'feed_post': return <ImageIcon className="w-3 h-3" />;
            case 'carousel': return <Film className="w-3 h-3" />;
            case 'youtube_dedicated': return <Youtube className="w-3 h-3" />;
            case 'tiktok_produced': return <Music className="w-3 h-3" />;
            default: return <Smartphone className="w-3 h-3" />;
        }
    };

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border hover:border-primary/20 transition-colors group">
            <Avatar className="h-10 w-10 border border-border shrink-0">
                <AvatarImage src={creator.profile_image_url || creator.image_url} />
                <AvatarFallback>{creator.name.substring(0, 2)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{creator.name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <Select value={deliverable.format} onValueChange={handleFormatChange}>
                        <SelectTrigger className="h-7 w-[140px] text-xs bg-background border-input focus:ring-0">
                            <SelectValue placeholder="Formato" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="story">📸 Story</SelectItem>
                            <SelectItem value="reels">🎬 Reels</SelectItem>
                            <SelectItem value="feed_post">🖼️ Post</SelectItem>
                            <SelectItem value="carousel">🎞️ Carrossel</SelectItem>
                            <SelectItem value="tiktok_simple">🎵 TikTok (S)</SelectItem>
                            <SelectItem value="tiktok_produced">🎵 TikTok (P)</SelectItem>
                            <SelectItem value="youtube_dedicated">▶️ YouTube</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Quantity Input */}
                <div className="relative w-16">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">x</span>
                    <Input
                        type="number"
                        min="1"
                        value={deliverable.quantity || 1}
                        onChange={(e) => {
                            const qty = parseInt(e.target.value) || 1;
                            // Calculate new price based on unit price (derived from current price / current qty OR metadata)
                            // Best effort: Get unit price from metadata if available, otherwise assume current price is total
                            let unitPrice = 0;
                            const formatKey = `price_${deliverable.format}`;
                            if (creator.admin_metadata && creator.admin_metadata[formatKey]) {
                                const raw = String(creator.admin_metadata[formatKey]);
                                const priceString = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
                                unitPrice = parseFloat(priceString) || 0;
                            }

                            // If no metadata price, try to derive from current total (fallback)
                            if (unitPrice === 0 && (deliverable.quantity || 1) > 0) {
                                unitPrice = deliverable.price / (deliverable.quantity || 1);
                            }

                            onUpdate({
                                ...deliverable,
                                quantity: qty,
                                price: unitPrice * qty
                            });
                        }}
                        className="h-8 pl-6 text-xs bg-background border-input text-center font-mono"
                    />
                </div>

                <div className="relative w-24">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                    <Input
                        type="number"
                        value={priceInput}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        className="h-8 pl-7 text-xs bg-background border-input text-right font-mono"
                    />
                </div>

                <Button
                    size="icon"
                    variant="ghost"
                    onClick={onRemove}
                    className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
