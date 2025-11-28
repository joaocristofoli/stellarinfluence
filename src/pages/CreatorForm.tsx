import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft } from "lucide-react";

export default function CreatorForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    bio: "",
    image_url: "",
    instagram_url: "",
    youtube_url: "",
    tiktok_url: "",
    twitter_url: "",
    instagram_active: false,
    youtube_active: false,
    tiktok_active: false,
    twitter_active: false,
    primaryColor: "#FF6B35",
    secondaryColor: "#004E89",
    layout: "default",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      navigate("/");
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isEdit && id) {
      fetchCreator();
    }
  }, [isEdit, id]);

  const fetchCreator = async () => {
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        const theme = data.landing_theme as any;
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          category: data.category || "",
          bio: data.bio || "",
          image_url: data.image_url || "",
          instagram_url: data.instagram_url || "",
          youtube_url: data.youtube_url || "",
          tiktok_url: data.tiktok_url || "",
          twitter_url: data.twitter_url || "",
          instagram_active: data.instagram_active || false,
          youtube_active: data.youtube_active || false,
          tiktok_active: data.tiktok_active || false,
          twitter_active: data.twitter_active || false,
          primaryColor: theme?.primaryColor || "#FF6B35",
          secondaryColor: theme?.secondaryColor || "#004E89",
          layout: theme?.layout || "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar criador",
        description: error.message,
        variant: "destructive",
      });
      navigate("/admin");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const creatorData = {
        name: formData.name,
        slug: formData.slug,
        category: formData.category,
        bio: formData.bio,
        image_url: formData.image_url,
        instagram_url: formData.instagram_url,
        youtube_url: formData.youtube_url,
        tiktok_url: formData.tiktok_url,
        twitter_url: formData.twitter_url,
        instagram_active: formData.instagram_active,
        youtube_active: formData.youtube_active,
        tiktok_active: formData.tiktok_active,
        twitter_active: formData.twitter_active,
        landing_theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          layout: formData.layout,
        },
      };

      if (isEdit) {
        const { error } = await supabase
          .from("creators")
          .update(creatorData)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Criador atualizado!",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        const { error } = await supabase.from("creators").insert([creatorData]);

        if (error) throw error;

        toast({
          title: "Criador cadastrado!",
          description: "O novo criador foi adicionado com sucesso.",
        });
      }

      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8">
            {isEdit ? "Editar Criador" : "Novo Criador"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8 glass rounded-3xl p-8">
            {/* Dados Básicos */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Dados Básicos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="ex: joao-silva"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="ex: Lifestyle, Tech, Gaming"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Foto</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="space-y-4 border-t border-border pt-6">
              <h2 className="text-xl font-semibold">Redes Sociais</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.instagram_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, instagram_active: checked })}
                    />
                    <Label>Ativo</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube_url">YouTube URL</Label>
                  <Input
                    id="youtube_url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.youtube_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, youtube_active: checked })}
                    />
                    <Label>Ativo</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok_url">TikTok URL</Label>
                  <Input
                    id="tiktok_url"
                    value={formData.tiktok_url}
                    onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.tiktok_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, tiktok_active: checked })}
                    />
                    <Label>Ativo</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter_url">Twitter/X URL</Label>
                  <Input
                    id="twitter_url"
                    value={formData.twitter_url}
                    onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.twitter_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, twitter_active: checked })}
                    />
                    <Label>Ativo</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Personalização da Landing */}
            <div className="space-y-4 border-t border-border pt-6">
              <h2 className="text-xl font-semibold">Personalização da Landing Page</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>{isEdit ? "Atualizar" : "Cadastrar"}</>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
