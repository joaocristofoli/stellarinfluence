import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, ExternalLink } from "lucide-react";
import { Creator } from "@/types/creator";


interface MobileCreatorCardProps {
    creator: Creator;
    onDelete: (id: string) => void;
}

export function MobileCreatorCard({ creator, onDelete }: MobileCreatorCardProps) {
    const navigate = useNavigate();

    const activePlatforms = [
        { active: creator.instagram_active, label: "IG" },
        { active: creator.youtube_active, label: "YT" },
        { active: creator.tiktok_active, label: "TT" },
        { active: creator.twitter_active, label: "TW" },
        { active: creator.kwai_active, label: "KW" },
    ].filter(p => p.active);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="glass border-border/50 hover:border-accent/50 transition-all duration-300 overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-accent/20 to-accent/5">
                                {creator.image_url ? (
                                    <img
                                        src={creator.image_url}
                                        alt={creator.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-accent">
                                        {creator.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate mb-1">{creator.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{creator.category}</p>

                            {/* Stats */}
                            <div className="flex gap-4 mb-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Seguidores: </span>
                                    <span className="font-medium">{creator.total_followers}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Eng: </span>
                                    <span className="font-medium">{creator.engagement_rate || '-'}</span>
                                </div>
                                {creator.kwai_active && (
                                    <div>
                                        <span className="text-muted-foreground">Kwai: </span>
                                        <span className="font-medium">{creator.kwai_followers || "-"}</span>
                                    </div>
                                )}
                            </div>

                            {/* Platforms */}
                            <div className="flex gap-1 mb-3 flex-wrap">
                                {activePlatforms.map(platform => (
                                    <Badge
                                        key={platform.label}
                                        variant="secondary"
                                        className="text-xs bg-accent/20 text-accent border-0"
                                    >
                                        {platform.label}
                                    </Badge>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => window.open(`/creator/${creator.slug}`, '_blank')}
                                >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Ver Público
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => navigate(`/admin/creators/${creator.id}`)}
                                >
                                    <Pencil className="w-3 h-3 mr-1" />
                                    Editar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(creator.id)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
