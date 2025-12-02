import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
    User,
    BarChart3,
    Settings,
    ExternalLink,
    Instagram,
    Youtube,
    Twitter,
    LogOut,
    Edit,
    Share2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareProfileDialog } from "@/components/ShareProfileDialog";
import { useToast } from "@/hooks/use-toast";

export default function CreatorDashboard() {
    const { user, loading: authLoading, isAdmin, isCreator, signOut } = useAuth();
    const { toast } = useToast();
    const { creator, loading: creatorLoading } = useCreatorProfile();
    const navigate = useNavigate();
    const [isShareOpen, setIsShareOpen] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate("/auth");
            return;
        }

        // If user is admin, redirect to admin panel
        if (isAdmin) {
            navigate("/admin");
            return;
        }

        // If not a creator, they will see the "Create Profile" screen below
        // so we don't redirect them away.
    }, [user, authLoading, isAdmin, isCreator, navigate]);

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    if (authLoading || creatorLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-lg text-muted-foreground">Carregando...</div>
            </div>
        );
    }

    if (!creator) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Complete seu Perfil</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Você ainda não configurou seu perfil de criador.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Configure agora para acessar seu painel.
                        </p>
                        <Button onClick={() => navigate("/creator/setup")} className="w-full bg-accent hover:bg-accent/90">
                            Criar Perfil
                        </Button>
                        <Button onClick={handleSignOut} variant="outline" className="w-full">
                            Sair
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass border-b border-border/50 sticky top-0 z-50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">
                                <span className="text-gradient">Meu Painel</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Olá, {creator.name}!
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setIsShareOpen(true)}
                                className="flex bg-accent hover:bg-accent/90"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Compartilhar
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/creator/${creator.slug || creator.id}`, '_blank')}
                                className="flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver Perfil
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleSignOut}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sair</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Profile Overview */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Meu Perfil</span>
                                <Button size="sm" variant="ghost" onClick={() => navigate("/creator/setup")}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-4">
                                <img
                                    src={creator.image_url}
                                    alt={creator.name}
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">{creator.name}</h3>
                                    <p className="text-sm text-accent mb-2">{creator.category}</p>
                                    <p className="text-muted-foreground text-sm">{creator.bio}</p>

                                    {/* Social Links */}
                                    <div className="flex gap-2 mt-4">
                                        {creator.instagram_active && creator.instagram_url && (
                                            <a
                                                href={creator.instagram_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 glass rounded-lg hover:bg-accent/10 transition-colors"
                                            >
                                                <Instagram className="w-4 h-4 text-pink-400" />
                                            </a>
                                        )}
                                        {creator.youtube_active && creator.youtube_url && (
                                            <a
                                                href={creator.youtube_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 glass rounded-lg hover:bg-accent/10 transition-colors"
                                            >
                                                <Youtube className="w-4 h-4 text-red-400" />
                                            </a>
                                        )}
                                        {creator.twitter_active && creator.twitter_url && (
                                            <a
                                                href={creator.twitter_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 glass rounded-lg hover:bg-accent/10 transition-colors"
                                            >
                                                <Twitter className="w-4 h-4 text-blue-400" />
                                            </a>
                                        )}
                                        {creator.kwai_active && creator.kwai_url && (
                                            <a
                                                href={creator.kwai_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 glass rounded-lg hover:bg-accent/10 transition-colors"
                                            >
                                                <span className="text-xs font-bold text-orange-500">K</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Estatísticas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Seguidores</div>
                                <div className="text-2xl font-bold text-accent">{creator.total_followers}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Engajamento</div>
                                <div className="text-2xl font-bold text-accent">{creator.engagement_rate}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card
                        className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-accent/20"
                        onClick={() => navigate("/creator/setup")}
                    >
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-accent/10 rounded-lg">
                                <User className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Editar Perfil</h4>
                                <p className="text-sm text-muted-foreground">
                                    Atualize suas informações
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-purple-500/20"
                        onClick={() => {
                            // Placeholder for metrics page
                            toast({
                                title: "Em breve",
                                description: "A visualização detalhada de métricas estará disponível em breve!",
                            });
                        }}
                    >
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Métricas</h4>
                                <p className="text-sm text-muted-foreground">
                                    Veja seu desempenho
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-blue-500/20"
                        onClick={() => navigate("/creator/setup")}
                    >
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Settings className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Configurações</h4>
                                <p className="text-sm text-muted-foreground">
                                    Preferências da conta
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <ShareProfileDialog
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                creatorSlug={creator.slug || creator.id}
            />
        </div>
    );
}
