import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Calendar,
    Megaphone,
    Newspaper,
    Users,
    MapPin,
    Phone,
    Mail,
    ExternalLink,
    ArrowRight,
    Building2,
    Clock,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Post {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    imagem_url: string;
    data_publicacao: string;
    visualizacoes: number;
    alcance: number;
    engajamento: number;
    status: string;
    tipo: string;
}

// Notícias reais de Toledo-PR (Janeiro 2026)
const exemploNoticias = [
    {
        id: "1",
        titulo: "Toledo alcança 5º maior Índice de Progresso Social do Paraná",
        categoria: "noticia",
        data_publicacao: "2026-01-08",
        imagem_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
        visualizacoes: 4520,
        tipo: "noticia",
    },
    {
        id: "2",
        titulo: "Sanepar anuncia investimentos para ampliar captação de água",
        categoria: "noticia",
        data_publicacao: "2026-01-07",
        imagem_url: "https://images.unsplash.com/photo-1581092160607-ee67df009c62?w=400&h=300&fit=crop",
        visualizacoes: 3890,
        tipo: "noticia",
    },
    {
        id: "3",
        titulo: "Réveillon no Parque Diva Paim Barth reúne 40 mil pessoas",
        categoria: "evento",
        data_publicacao: "2026-01-01",
        imagem_url: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&h=300&fit=crop",
        visualizacoes: 8750,
        tipo: "noticia",
    },
    {
        id: "4",
        titulo: "Rede municipal inicia reformas em escolas e CMEIs",
        categoria: "acao_social",
        data_publicacao: "2026-01-06",
        imagem_url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop",
        visualizacoes: 2340,
        tipo: "noticia",
    },
    {
        id: "5",
        titulo: "Operação Tapa Buraco recupera malha asfáltica da cidade",
        categoria: "noticia",
        data_publicacao: "2026-01-06",
        imagem_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop",
        visualizacoes: 1890,
        tipo: "noticia",
    },
    {
        id: "6",
        titulo: "Secretaria de Esportes divulga calendário de competições 2026",
        categoria: "evento",
        data_publicacao: "2026-01-05",
        imagem_url: "https://images.unsplash.com/photo-1461896836934- voices?w=400&h=300&fit=crop",
        visualizacoes: 2150,
        tipo: "noticia",
    },
    {
        id: "7",
        titulo: "DER doa passarela para pedestres na PR-317",
        categoria: "noticia",
        data_publicacao: "2026-01-04",
        imagem_url: "https://images.unsplash.com/photo-1513039464749-94912b3841ce?w=400&h=300&fit=crop",
        visualizacoes: 1560,
        tipo: "noticia",
    },
    {
        id: "8",
        titulo: "Toledo sediará Jogos Abertos do Paraná em novembro",
        categoria: "evento",
        data_publicacao: "2026-01-03",
        imagem_url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop",
        visualizacoes: 3420,
        tipo: "noticia",
    },
];

const exemploCampanhas = [
    {
        id: "c1",
        titulo: "Operação Tapa Buraco 2026",
        descricao: "Manutenção e reparos na malha asfáltica com investimento de R$ 400 mil",
        alcance: 52000,
        engajamento: 14.8,
        status: "publicado",
        tipo: "campanha",
    },
    {
        id: "c2",
        titulo: "Reformas em Escolas Municipais",
        descricao: "Investimento de R$ 230 mil em ampliação e melhorias antes do início das aulas",
        alcance: 38000,
        engajamento: 11.2,
        status: "publicado",
        tipo: "campanha",
    },
    {
        id: "c3",
        titulo: "Segurança Hídrica - Sanepar",
        descricao: "Divulgação dos investimentos em captação de água para 2026-2030",
        alcance: 45000,
        engajamento: 9.5,
        status: "publicado",
        tipo: "campanha",
    },
];

const influenciadores = [
    {
        id: 1,
        nome: "Ana Silva",
        especialidade: "Lifestyle & Família",
        seguidores: "52K",
        foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    },
    {
        id: 2,
        nome: "Carlos Mendes",
        especialidade: "Gastronomia",
        seguidores: "38K",
        foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    },
    {
        id: 3,
        nome: "Julia Ferreira",
        especialidade: "Saúde & Bem-estar",
        seguidores: "67K",
        foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    },
    {
        id: 4,
        nome: "Pedro Santos",
        especialidade: "Esportes",
        seguidores: "41K",
        foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    },
];

const categoriaLabels: Record<string, string> = {
    evento: "Evento",
    acao_social: "Ação Social",
    noticia: "Notícia",
    cultura: "Cultura",
};

const statusLabels: Record<string, string> = {
    rascunho: "Em andamento",
    publicado: "Ativa",
    arquivado: "Concluída",
};

const categorias = [
    { nome: "Todos", valor: "todos", icone: Newspaper },
    { nome: "Eventos", valor: "evento", icone: Calendar },
    { nome: "Ações Sociais", valor: "acao_social", icone: Megaphone },
    { nome: "Cultura", valor: "cultura", icone: Users },
];

export default function ToledoPrefeitura() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [campanhas, setCampanhas] = useState<Post[]>([]);
    const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from("toledo_posts")
                .select("*")
                .eq("status", "publicado")
                .order("data_publicacao", { ascending: false });

            if (error) {
                console.log("Using fallback data");
                setPosts(exemploNoticias as any);
                setCampanhas(exemploCampanhas as any);
            } else if (data && data.length > 0) {
                setPosts(data.filter((p: Post) => p.tipo === "noticia"));
                setCampanhas(data.filter((p: Post) => p.tipo === "campanha"));
            } else {
                setPosts(exemploNoticias as any);
                setCampanhas(exemploCampanhas as any);
            }
        } catch (error) {
            console.log("Using fallback data");
            setPosts(exemploNoticias as any);
            setCampanhas(exemploCampanhas as any);
        } finally {
            setLoading(false);
        }
    };

    const postsFiltrados = categoriaAtiva === "todos"
        ? posts
        : posts.filter(p => p.categoria === categoriaAtiva);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="min-h-screen bg-white relative overflow-x-hidden">
            {/* Header institucional */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/toledo-brasao.png"
                            alt="Brasão de Toledo"
                            className="w-12 h-12 object-contain"
                        />
                        <div>
                            <h1 className="font-bold text-gray-900 text-lg leading-tight">Toledo - PR</h1>
                            <p className="text-xs text-gray-500">Divulgação Oficial</p>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#noticias" className="text-sm text-gray-600 hover:text-green-700 transition-colors">Notícias</a>
                        <a href="#acoes" className="text-sm text-gray-600 hover:text-green-700 transition-colors">Ações</a>
                        <a href="#influenciadores" className="text-sm text-gray-600 hover:text-green-700 transition-colors">Influenciadores</a>
                        <a href="#contato" className="text-sm text-gray-600 hover:text-green-700 transition-colors">Contato</a>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-green-50 to-white py-16 lg:py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                        {/* Brasão */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="flex-shrink-0"
                        >
                            <img
                                src="/toledo-brasao.png"
                                alt="Brasão Oficial de Toledo - PR"
                                className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 object-contain"
                            />
                        </motion.div>

                        {/* Content */}
                        <div className="text-center lg:text-left flex-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 border border-green-200 mb-4"
                            >
                                <Building2 className="w-4 h-4 text-green-700" />
                                <span className="text-sm font-medium text-green-800">
                                    Parceiro Oficial de Comunicação
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
                            >
                                Prefeitura de{" "}
                                <span className="text-green-700">Toledo</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-base text-gray-600 mb-6 max-w-xl"
                            >
                                Divulgação de notícias, eventos e ações da <strong>Capital Paranaense do Agronegócio</strong> através da nossa rede de influenciadores.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-wrap gap-4 justify-center lg:justify-start"
                            >
                                <Button
                                    size="lg"
                                    className="bg-green-700 hover:bg-green-800 text-white rounded-md"
                                    onClick={() => document.getElementById("noticias")?.scrollIntoView({ behavior: "smooth" })}
                                >
                                    Ver Publicações
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
                                    asChild
                                >
                                    <a href="https://toledo.pr.gov.br" target="_blank" rel="noopener noreferrer">
                                        Site Oficial
                                        <ExternalLink className="ml-2 w-4 h-4" />
                                    </a>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats da parceria */}
            <section className="py-10 px-6 bg-green-700">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                        <div className="text-3xl font-bold text-white">{posts.length + campanhas.length || "150"}+</div>
                        <div className="text-sm text-green-100">Publicações</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">500K+</div>
                        <div className="text-sm text-green-100">Alcance Total</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">{influenciadores.length}</div>
                        <div className="text-sm text-green-100">Influenciadores</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">2024</div>
                        <div className="text-sm text-green-100">Início da Parceria</div>
                    </div>
                </div>
            </section>

            {/* Notícias e Publicações */}
            <section id="noticias" className="py-16 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Últimas Publicações
                            </h2>
                            <p className="text-gray-600 mt-1">Notícias e conteúdos divulgados para a prefeitura</p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {categorias.map((cat) => (
                                <Button
                                    key={cat.valor}
                                    variant={categoriaAtiva === cat.valor ? "default" : "outline"}
                                    size="sm"
                                    className={categoriaAtiva === cat.valor ? "bg-green-700 hover:bg-green-800" : ""}
                                    onClick={() => setCategoriaAtiva(cat.valor)}
                                >
                                    <cat.icone className="w-4 h-4 mr-1" />
                                    {cat.nome}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {postsFiltrados.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="bg-white border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                                    <div className="relative h-40 overflow-hidden">
                                        <img
                                            src={post.imagem_url || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop"}
                                            alt={post.titulo}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <Badge className="absolute top-3 left-3 bg-green-700">
                                            {categoriaLabels[post.categoria] || post.categoria}
                                        </Badge>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-green-700 transition-colors">
                                            {post.titulo}
                                        </h3>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(post.data_publicacao)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {(post.visualizacoes || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {postsFiltrados.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhuma publicação nesta categoria.</p>
                        </div>
                    )}

                    <div className="text-center mt-8">
                        <Button variant="outline" className="border-green-700 text-green-700 hover:bg-green-50">
                            Ver Todas as Publicações
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Ações e Campanhas */}
            <section id="acoes" className="py-16 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Ações & Campanhas
                        </h2>
                        <p className="text-gray-600">Campanhas de divulgação realizadas para a prefeitura</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {campanhas.map((acao, index) => (
                            <motion.div
                                key={acao.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="bg-gray-50 border-gray-200 h-full">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge
                                                variant={acao.status === "arquivado" ? "default" : acao.status === "publicado" ? "secondary" : "outline"}
                                                className={acao.status === "arquivado" ? "bg-green-600" : ""}
                                            >
                                                {statusLabels[acao.status] || acao.status}
                                            </Badge>
                                            <Megaphone className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <CardTitle className="text-lg text-gray-900">{acao.titulo}</CardTitle>
                                        <CardDescription>{acao.descricao}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="text-xl font-bold text-green-700">
                                                    {(acao.alcance || 0) >= 1000
                                                        ? `${Math.round((acao.alcance || 0) / 1000)}K+`
                                                        : acao.alcance || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Alcance</div>
                                            </div>
                                            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="text-xl font-bold text-green-700">{acao.engajamento || 0}%</div>
                                                <div className="text-xs text-gray-500">Engajamento</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Influenciadores */}
            <section id="influenciadores" className="py-16 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Nossa Equipe de Influenciadores
                        </h2>
                        <p className="text-gray-600">Criadores de conteúdo que divulgam as ações de Toledo</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {influenciadores.map((inf, index) => (
                            <motion.div
                                key={inf.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="relative inline-block mb-4">
                                    <img
                                        src={inf.foto}
                                        alt={inf.nome}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {inf.seguidores}
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900">{inf.nome}</h3>
                                <p className="text-sm text-gray-500">{inf.especialidade}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Button variant="outline" className="border-green-700 text-green-700 hover:bg-green-50" asChild>
                            <a href="/">
                                Ver Todos os Criadores
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contato" className="py-16 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Quer Divulgar com a Gente?
                        </h2>
                        <p className="text-gray-600">
                            Entre em contato para solicitar a divulgação de eventos ou ações da prefeitura
                        </p>
                    </div>

                    <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="p-8">
                            <div className="grid sm:grid-cols-2 gap-6 mb-8">
                                <a
                                    href="tel:+5545999999999"
                                    className="flex items-center gap-4 p-5 rounded-lg bg-white border border-gray-200 hover:border-green-300 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Phone className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-sm">Telefone</div>
                                        <div className="text-gray-900 font-semibold">(45) 99999-9999</div>
                                    </div>
                                </a>

                                <a
                                    href="mailto:contato@stellarinfluence.com"
                                    className="flex items-center gap-4 p-5 rounded-lg bg-white border border-gray-200 hover:border-green-300 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Mail className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-sm">E-mail</div>
                                        <div className="text-gray-900 font-semibold">contato@stellarinfluence.com</div>
                                    </div>
                                </a>
                            </div>

                            <div className="text-center pt-6 border-t border-gray-200">
                                <Button
                                    size="lg"
                                    className="bg-green-700 hover:bg-green-800 text-white"
                                    asChild
                                >
                                    <a
                                        href="https://wa.me/5545999999999?text=Olá! Gostaria de solicitar uma divulgação para a Prefeitura de Toledo."
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Falar no WhatsApp
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-10 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <img
                            src="/toledo-brasao.png"
                            alt="Brasão de Toledo"
                            className="w-10 h-10 object-contain"
                        />
                        <div>
                            <h3 className="font-bold">Toledo - PR</h3>
                            <p className="text-gray-400 text-sm">Parceria de Comunicação</p>
                        </div>
                    </div>
                    <div className="text-center md:text-right text-sm text-gray-400">
                        <p>Divulgação realizada por <strong className="text-white">Stellar Influence</strong></p>
                        <p>© 2026 Todos os direitos reservados</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
