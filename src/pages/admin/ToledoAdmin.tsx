import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormattedNumberInput } from "@/components/ui/FormattedNumberInput";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
    Plus,
    ArrowLeft,
    Trash2,
    Edit,
    Eye,
    Calendar,
    Megaphone,
    Newspaper,
    Users,
    Save,
    X
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ToledoPost {
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

const categoriaIcons: Record<string, any> = {
    evento: Calendar,
    acao_social: Megaphone,
    noticia: Newspaper,
    cultura: Users,
};

const categoriaLabels: Record<string, string> = {
    evento: "Evento",
    acao_social: "Ação Social",
    noticia: "Notícia",
    cultura: "Cultura",
};

const statusLabels: Record<string, string> = {
    rascunho: "Rascunho",
    publicado: "Publicado",
    arquivado: "Arquivado",
};

export default function ToledoAdmin() {
    const navigate = useNavigate();
    const { isAdmin, loading: authLoading } = useAuth();
    const [posts, setPosts] = useState<ToledoPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<ToledoPost | null>(null);

    const [formData, setFormData] = useState({
        titulo: "",
        descricao: "",
        categoria: "noticia",
        imagem_url: "",
        status: "rascunho",
        tipo: "noticia",
        alcance: 0,
        engajamento: 0,
    });

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate("/admin");
            return;
        }
        fetchPosts();
    }, [isAdmin, authLoading]);

    const fetchPosts = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from("toledo_posts")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingPost) {
                const { error } = await (supabase as any)
                    .from("toledo_posts")
                    .update({
                        ...formData,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", editingPost.id);

                if (error) throw error;
                toast({ title: "Publicação atualizada!" });
            } else {
                const { error } = await (supabase as any)
                    .from("toledo_posts")
                    .insert([formData]);

                if (error) throw error;
                toast({ title: "Publicação criada!" });
            }

            setDialogOpen(false);
            resetForm();
            fetchPosts();
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleEdit = (post: ToledoPost) => {
        setEditingPost(post);
        setFormData({
            titulo: post.titulo,
            descricao: post.descricao || "",
            categoria: post.categoria,
            imagem_url: post.imagem_url || "",
            status: post.status,
            tipo: post.tipo,
            alcance: post.alcance,
            engajamento: post.engajamento,
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta publicação?")) return;

        try {
            const { error } = await (supabase as any)
                .from("toledo_posts")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({ title: "Publicação excluída!" });
            fetchPosts();
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const resetForm = () => {
        setEditingPost(null);
        setFormData({
            titulo: "",
            descricao: "",
            categoria: "noticia",
            imagem_url: "",
            status: "rascunho",
            tipo: "noticia",
            alcance: 0,
            engajamento: 0,
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <img
                                src="/toledo-brasao.png"
                                alt="Toledo"
                                className="w-10 h-10 object-contain"
                            />
                            <div>
                                <h1 className="font-bold text-gray-900 text-lg">Toledo - Admin</h1>
                                <p className="text-xs text-gray-500">Gerenciar Publicações</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" asChild>
                            <a href="/toledo" target="_blank">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Página
                            </a>
                        </Button>
                        <Dialog open={dialogOpen} onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button className="bg-green-700 hover:bg-green-800">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nova Publicação
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingPost ? "Editar Publicação" : "Nova Publicação"}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <Label>Título</Label>
                                            <Input
                                                value={formData.titulo}
                                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                                placeholder="Título da publicação"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label>Categoria</Label>
                                            <Select
                                                value={formData.categoria}
                                                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="noticia">Notícia</SelectItem>
                                                    <SelectItem value="evento">Evento</SelectItem>
                                                    <SelectItem value="acao_social">Ação Social</SelectItem>
                                                    <SelectItem value="cultura">Cultura</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Status</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="rascunho">Rascunho</SelectItem>
                                                    <SelectItem value="publicado">Publicado</SelectItem>
                                                    <SelectItem value="arquivado">Arquivado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Tipo</Label>
                                            <Select
                                                value={formData.tipo}
                                                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="noticia">Notícia</SelectItem>
                                                    <SelectItem value="campanha">Campanha/Ação</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>URL da Imagem</Label>
                                            <Input
                                                value={formData.imagem_url}
                                                onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                                                placeholder="https://..."
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <Label>Descrição</Label>
                                            <Textarea
                                                value={formData.descricao}
                                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                                placeholder="Descrição da publicação..."
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <Label>Alcance</Label>
                                            <FormattedNumberInput
                                                value={formData.alcance}
                                                onChange={(value) => setFormData({ ...formData, alcance: value })}
                                            />
                                        </div>

                                        <div>
                                            <Label>Engajamento (%)</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={formData.engajamento}
                                                onChange={(e) => setFormData({ ...formData, engajamento: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                            <X className="w-4 h-4 mr-2" />
                                            Cancelar
                                        </Button>
                                        <Button type="submit" className="bg-green-700 hover:bg-green-800">
                                            <Save className="w-4 h-4 mr-2" />
                                            {editingPost ? "Salvar" : "Criar"}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Publicações ({posts.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {posts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhuma publicação ainda.</p>
                                <p className="text-sm">Clique em "Nova Publicação" para começar.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Categoria</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Alcance</TableHead>
                                        <TableHead>Engajamento</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {posts.map((post) => {
                                        const CatIcon = categoriaIcons[post.categoria] || Newspaper;
                                        return (
                                            <TableRow key={post.id}>
                                                <TableCell className="font-medium max-w-[200px] truncate">
                                                    {post.titulo}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <CatIcon className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm">{categoriaLabels[post.categoria]}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            post.status === "publicado" ? "default" :
                                                                post.status === "arquivado" ? "secondary" : "outline"
                                                        }
                                                        className={post.status === "publicado" ? "bg-green-600" : ""}
                                                    >
                                                        {statusLabels[post.status]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{post.alcance?.toLocaleString() || 0}</TableCell>
                                                <TableCell>{post.engajamento || 0}%</TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {new Date(post.data_publicacao).toLocaleDateString("pt-BR")}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(post)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDelete(post.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
