import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
    onFilterChange: (filters: FilterState) => void;
    categories: string[];
}

export interface FilterState {
    search: string;
    category: string;
    minFollowers: string;
    engagementMin: string;
    platforms: string[];
}

export function FilterBar({ onFilterChange, categories }: FilterBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        category: "all",
        minFollowers: "",
        engagementMin: "",
        platforms: [],
    });

    const platforms = ["instagram", "youtube", "tiktok", "twitter"];

    const updateFilters = (newFilters: Partial<FilterState>) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        onFilterChange(updated);
    };

    const togglePlatform = (platform: string) => {
        const newPlatforms = filters.platforms.includes(platform)
            ? filters.platforms.filter(p => p !== platform)
            : [...filters.platforms, platform];

        updateFilters({ platforms: newPlatforms });
    };

    const clearFilters = () => {
        const emptyFilters: FilterState = {
            search: "",
            category: "all",
            minFollowers: "",
            engagementMin: "",
            platforms: [],
        };
        setFilters(emptyFilters);
        onFilterChange(emptyFilters);
    };

    const hasActiveFilters =
        filters.search ||
        filters.category !== "all" ||
        filters.minFollowers ||
        filters.engagementMin ||
        filters.platforms.length > 0;

    return (
        <div className="space-y-4">
            {/* Search and Toggle */}
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        placeholder="Buscar criadores..."
                        value={filters.search}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        className="w-full"
                    />
                </div>
                <Button
                    variant={isExpanded ? "default" : "outline"}
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={isExpanded ? "bg-accent" : ""}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                </Button>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="glass rounded-2xl p-4 space-y-4">
                            {/* Category */}
                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <Select
                                    value={filters.category}
                                    onValueChange={(value) => updateFilters({ category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas as categorias" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Min Followers */}
                            <div className="space-y-2">
                                <Label>Seguidores Mínimos</Label>
                                <Input
                                    type="text"
                                    placeholder="Ex: 100K, 1M"
                                    value={filters.minFollowers}
                                    onChange={(e) => updateFilters({ minFollowers: e.target.value })}
                                />
                            </div>

                            {/* Engagement */}
                            <div className="space-y-2">
                                <Label>Engajamento Mínimo (%)</Label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 5"
                                    value={filters.engagementMin}
                                    onChange={(e) => updateFilters({ engagementMin: e.target.value })}
                                />
                            </div>

                            {/* Platforms */}
                            <div className="space-y-2">
                                <Label>Plataformas</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {platforms.map((platform) => (
                                        <Badge
                                            key={platform}
                                            variant={filters.platforms.includes(platform) ? "default" : "outline"}
                                            className={`cursor-pointer transition-all ${filters.platforms.includes(platform)
                                                ? "bg-accent hover:bg-accent/90"
                                                : "hover:bg-accent/20"
                                                }`}
                                            onClick={() => togglePlatform(platform)}
                                        >
                                            {platform === "instagram" && "Instagram"}
                                            {platform === "youtube" && "YouTube"}
                                            {platform === "tiktok" && "TikTok"}
                                            {platform === "twitter" && "Twitter"}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Button */}
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="w-full"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Limpar Filtros
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Filters Display */}
            {hasActiveFilters && !isExpanded && (
                <div className="flex gap-2 flex-wrap">
                    {filters.category !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                            {filters.category}
                        </Badge>
                    )}
                    {filters.minFollowers && (
                        <Badge variant="secondary" className="text-xs">
                            Min: {filters.minFollowers}
                        </Badge>
                    )}
                    {filters.engagementMin && (
                        <Badge variant="secondary" className="text-xs">
                            Eng: {filters.engagementMin}%+
                        </Badge>
                    )}
                    {filters.platforms.map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs">
                            {p}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
