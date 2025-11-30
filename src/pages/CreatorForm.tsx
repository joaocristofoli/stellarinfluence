import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { LAYOUT_PRESETS, LayoutType } from "@/types/landingTheme";
import { formatNumber, parseFormattedNumber } from "@/utils/formatNumbers";

// Helper function to safely parse numbers
const parseNumber = (value: string | number | null | undefined) => {
  if (!value) return null;
  if (typeof value === 'number') return value;
  return parseFormattedNumber(value.toString());
};

export default function CreatorForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
    kwai_url: "",
    instagram_active: false,
    youtube_active: false,
    tiktok_active: false,
    twitter_active: false,
    kwai_active: false,
    primaryColor: "#FF6B35",
    secondaryColor: "#004E89",
    layout: "default",
    instagram_followers: "",
    tiktok_followers: "",
    youtube_subscribers: "",
    twitter_followers: "",
    kwai_followers: "",
    engagement_rate: "",
    stories_views: "",
    gallery_urls: "",
    phone: "",
    primary_platform: "",
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    // Allow if admin OR if user is authenticated (for self-setup)
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin && id) {
      fetchCreator(id);
    } else if (!isAdmin && user) {
      fetchCreatorByUserId(user.id);
    }
  }, [isAdmin, id, user]);

  const fetchCreator = async (creatorId: string) => {
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("id", creatorId)
        .single();

      if (error) throw error;
      if (data) populateForm(data);
    } catch (error: any) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
      navigate("/admin");
    }
  };

  const fetchCreatorByUserId = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      if (data) populateForm(data);
    } catch (error: any) {
      console.error("Error fetching creator:", error);
      // Don't redirect, just let them create new
    }
  };

  const [platformSettings, setPlatformSettings] = useState<any[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('platform_settings').select('*');
      if (data) setPlatformSettings(data);
    };
    fetchSettings();
  }, []);

  const populateForm = (creator: any) => {
    const theme = creator.landing_theme as any;
    setFormData({
      name: creator.name || "",
      slug: creator.slug || "",
      category: creator.category || "",
      bio: creator.bio || "",
      image_url: creator.image_url || "",
      instagram_url: creator.instagram_url || "",
      youtube_url: creator.youtube_url || "",
      tiktok_url: creator.tiktok_url || "",
      twitter_url: creator.twitter_url || "",
      kwai_url: creator.kwai_url || "",
      instagram_active: creator.instagram_active || false,
      youtube_active: creator.youtube_active || false,
      tiktok_active: creator.tiktok_active || false,
      twitter_active: creator.twitter_active || false,
      kwai_active: creator.kwai_active || false,
      primaryColor: theme?.primaryColor || "#FF6B35",
      secondaryColor: theme?.secondaryColor || "#004E89",
      layout: theme?.layout || "default",
      instagram_followers: creator.instagram_followers?.toString() || creator.total_followers?.toString() || "",
      tiktok_followers: creator.tiktok_followers?.toString() || "",
      youtube_subscribers: creator.youtube_subscribers?.toString() || "",
      twitter_followers: creator.twitter_followers?.toString() || "",
      kwai_followers: creator.kwai_followers?.toString() || "",
      engagement_rate: creator.engagement_rate || "",
      stories_views: creator.stories_views || "",
      gallery_urls: Array.isArray(creator.gallery_urls) ? creator.gallery_urls.join('\n') : "",
      phone: creator.phone || "",
      primary_platform: creator.primary_platform || "",
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Prevent spaces
    if (value.includes(' ')) return;
    setFormData({ ...formData, slug: value.toLowerCase() });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Auto-generate slug if empty
      let finalSlug = formData.slug;
      if (!finalSlug && formData.name) {
        finalSlug = formData.name.toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special chars
          .replace(/\s+/g, '-') // Replace spaces with -
          .replace(/-+/g, '-'); // Remove duplicate -
      }

      if (!finalSlug) {
        toast({ title: "Erro", description: "O campo Slug (URL) é obrigatório.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const creatorData = {
        name: formData.name,
        slug: finalSlug,
        category: formData.category,
        bio: formData.bio,
        image_url: formData.image_url,
        instagram_url: formData.instagram_url,
        youtube_url: formData.youtube_url,
        tiktok_url: formData.tiktok_url,
        twitter_url: formData.twitter_url,
        kwai_url: formData.kwai_url,
        instagram_active: formData.instagram_active,
        youtube_active: formData.youtube_active,
        tiktok_active: formData.tiktok_active,
        twitter_active: formData.twitter_active,
        kwai_active: formData.kwai_active,
        // Parse numbers for DB
        total_followers: parseNumber(formData.instagram_followers),
        instagram_followers: parseNumber(formData.instagram_followers),
        tiktok_followers: parseNumber(formData.tiktok_followers),
        youtube_subscribers: parseNumber(formData.youtube_subscribers),
        twitter_followers: parseNumber(formData.twitter_followers),
        kwai_followers: parseNumber(formData.kwai_followers),
        engagement_rate: formData.engagement_rate,
        stories_views: formData.stories_views,
        gallery_urls: formData.gallery_urls.split('\n').filter(url => url.trim() !== ''),
        phone: formData.phone,
        primary_platform: formData.primary_platform,
        landing_theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          layout: formData.layout,
        },
        // Only set user_id if NOT admin, or if admin is updating existing profile
        // This allows admins to create profiles for others without assigning their own user_id
        ...(!isAdmin && { user_id: user?.id })
      } as any;

      let error;
      if (isAdmin && id) {
        // Admin updating existing profile
        const { error: updateError } = await supabase.from("creators").update(creatorData).eq("id", id);
        error = updateError;
      } else if (isAdmin && !id) {
        // Admin creating new profile (without user_id)
        const { error: insertError } = await supabase.from("creators").insert(creatorData);
        error = insertError;
      } else {
        // Non-admin user creating/updating their own profile
        const { error: upsertError } = await supabase.from("creators").upsert(creatorData, { onConflict: 'user_id' });
        error = upsertError;
      }

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Perfil salvo com sucesso." });

      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/creator/dashboard");
      }
    } catch (error: any) {
      console.error("Error saving creator:", error);
      toast({ title: "Erro", description: error.message || "Erro desconhecido ao salvar.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-4 md:px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="flex gap-2">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-colors ${step === currentStep ? 'bg-accent' : step < currentStep ? 'bg-accent/50' : 'bg-white/10'}`}
            />
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-2">Perfil do Criador</h1>
                  <p className="text-white/60">Informações básicas e apresentação</p>
                </div>

                <ImageUpload
                  currentImage={formData.image_url}
                  onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                  label="Foto de Perfil"
                />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: João Silva" />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (URL)</Label>
                    <Input value={formData.slug} onChange={handleSlugChange} placeholder="ex: joao-silva" />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Ex: Lifestyle" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={4} placeholder="Uma breve descrição..." />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp / Telefone</Label>
                    <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-2">Redes Sociais</h1>
                  <p className="text-white/60">Conecte as plataformas e estatísticas</p>
                </div>

                {/* Social Cards */}
                {/* Social Cards */}
                {[
                  { id: 'instagram', label: 'Instagram', color: 'text-pink-500', placeholder: 'instagram.com/seu_perfil' },
                  { id: 'youtube', label: 'YouTube', color: 'text-red-500', placeholder: 'youtube.com/@seu_canal' },
                  { id: 'tiktok', label: 'TikTok', color: 'text-cyan-500', placeholder: 'tiktok.com/@seu_perfil' },
                  { id: 'twitter', label: 'Twitter/X', color: 'text-blue-400', placeholder: 'twitter.com/seu_perfil' },
                  { id: 'kwai', label: 'Kwai', color: 'text-orange-500', placeholder: 'kwai.com/@seu_perfil' },
                ].map(social => (
                  <div key={social.id} className="p-4 glass rounded-xl space-y-4 border border-white/5 transition-all hover:border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Label className={`text-lg font-medium ${social.color}`}>{social.label}</Label>
                        {(formData as any)[`${social.id}_active`] && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Ativo</span>
                        )}
                      </div>
                      <Switch
                        checked={(formData as any)[`${social.id}_active`]}
                        onCheckedChange={c => setFormData({ ...formData, [`${social.id}_active`]: c })}
                      />
                    </div>

                    {(formData as any)[`${social.id}_active`] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                      >
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Link do Perfil</Label>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const setting = platformSettings.find(s => s.platform === social.id);
                              const baseUrl = setting?.base_url || '';
                              const currentUrl = (formData as any)[`${social.id}_url`];
                              // Display handle only if it starts with baseUrl
                              const displayValue = currentUrl?.startsWith(baseUrl)
                                ? currentUrl.slice(baseUrl.length)
                                : currentUrl;

                              return (
                                <>
                                  {baseUrl && (
                                    <span className="text-sm text-muted-foreground whitespace-nowrap bg-white/5 px-2 py-2 rounded-md border border-white/10">
                                      {baseUrl}
                                    </span>
                                  )}
                                  <Input
                                    value={displayValue}
                                    onChange={e => {
                                      const val = e.target.value;
                                      // If baseUrl exists, prepend it to save. Otherwise save as is.
                                      const finalUrl = baseUrl ? `${baseUrl}${val}` : val;
                                      setFormData({ ...formData, [`${social.id}_url`]: finalUrl });
                                    }}
                                    placeholder={social.placeholder.replace('instagram.com/', '').replace('youtube.com/', '').replace('tiktok.com/', '').replace('twitter.com/', '').replace('kwai.com/', '')}
                                    className="bg-black/20"
                                  />
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                            {social.id === 'youtube' ? 'Inscritos' : 'Seguidores'}
                          </Label>
                          <div className="relative">
                            <Input
                              value={(formData as any)[social.id === 'youtube' ? 'youtube_subscribers' : `${social.id}_followers`]}
                              onChange={e => {
                                const field = social.id === 'youtube' ? 'youtube_subscribers' : `${social.id}_followers`;
                                // Allow typing freely, we format on blur or display
                                setFormData({ ...formData, [field]: e.target.value })
                              }}
                              onBlur={e => {
                                const field = social.id === 'youtube' ? 'youtube_subscribers' : `${social.id}_followers`;
                                const val = e.target.value;
                                // Simple auto-format if user types raw number like 1500 -> 1.5K
                                if (val && !isNaN(Number(val))) {
                                  const num = Number(val);
                                  if (num >= 1000) {
                                    const formatted = formatNumber(num);
                                    setFormData(prev => ({ ...prev, [field]: formatted }));
                                  }
                                }
                              }}
                              placeholder="Ex: 10K, 1.5M"
                              className="bg-black/20 font-mono"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                              {social.id === 'youtube' ? 'Subs' : 'Followers'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}

                <div className="p-4 glass rounded-xl space-y-4">
                  <h3 className="font-medium">Configurações Gerais</h3>
                  <div className="space-y-2">
                    <Label>Rede Principal (Destaque)</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.primary_platform}
                      onChange={(e) => setFormData({ ...formData, primary_platform: e.target.value })}
                    >
                      <option value="">Selecione a rede principal...</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="kwai">Kwai</option>
                    </select>
                    <p className="text-xs text-muted-foreground">Esta rede terá destaque na apresentação dos números.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Engajamento (%)</Label>
                      <Input value={formData.engagement_rate} onChange={e => setFormData({ ...formData, engagement_rate: e.target.value })} placeholder="4.5%" />
                    </div>
                    <div className="space-y-2">
                      <Label>Views Stories</Label>
                      <Input value={formData.stories_views} onChange={e => setFormData({ ...formData, stories_views: e.target.value })} placeholder="50K" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-2">Personalização</h1>
                  <p className="text-white/60">Aparência da Landing Page</p>
                </div>

                <div className="space-y-4 p-4 md:p-6 glass rounded-xl">
                  <h3 className="font-medium mb-4">Escolha um Tema</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {(Object.keys(LAYOUT_PRESETS) as LayoutType[]).map((themeKey) => {
                      const preset = LAYOUT_PRESETS[themeKey];
                      const isSelected = formData.layout === themeKey;

                      return (
                        <div
                          key={themeKey}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              layout: themeKey,
                              primaryColor: preset.primaryColor || formData.primaryColor,
                              secondaryColor: preset.secondaryColor || formData.secondaryColor,
                              // We can also update fonts/bg if we want to fully enforce the preset
                            });
                          }}
                          className={`
                            cursor-pointer relative overflow-hidden rounded-xl border-2 transition-all duration-300
                            ${isSelected ? 'border-accent scale-105 shadow-[0_0_20px_rgba(255,107,53,0.3)]' : 'border-white/10 hover:border-white/30'}
                          `}
                        >
                          <div className="aspect-square relative p-3 flex flex-col justify-between" style={{ backgroundColor: preset.backgroundColor }}>
                            <div className="w-full h-1/3 rounded-lg opacity-80" style={{ backgroundColor: preset.primaryColor }} />
                            <div className="w-2/3 h-2 rounded-full opacity-60" style={{ backgroundColor: preset.secondaryColor }} />
                            <div className="space-y-1">
                              <div className="w-full h-1 rounded-full bg-current opacity-20" style={{ color: preset.textColor }} />
                              <div className="w-3/4 h-1 rounded-full bg-current opacity-20" style={{ color: preset.textColor }} />
                            </div>
                          </div>
                          <div className="p-2 text-center text-xs font-medium uppercase tracking-wider bg-black/50 backdrop-blur-sm absolute bottom-0 w-full">
                            {themeKey}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 p-4 md:p-6 glass rounded-xl">
                  <h3 className="font-medium mb-4">Cores do Tema</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Cor Primária</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} className="w-12 h-12 p-1 cursor-pointer" />
                        <Input value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} className="uppercase" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cor Secundária</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={formData.secondaryColor} onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })} className="w-12 h-12 p-1 cursor-pointer" />
                        <Input value={formData.secondaryColor} onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })} className="uppercase" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 md:p-6 glass rounded-xl">
                  <h3 className="font-medium mb-4">Galeria de Fotos</h3>
                  <div className="space-y-2">
                    <Label>Links das Imagens (um por linha)</Label>
                    <Textarea
                      value={formData.gallery_urls}
                      onChange={e => setFormData({ ...formData, gallery_urls: e.target.value })}
                      rows={6}
                      placeholder="https://..."
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-white/10 z-50">
        <div className="max-w-2xl mx-auto flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="w-full"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={nextStep}
              className="w-full bg-accent hover:bg-accent/90 text-white"
            >
              Próximo <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Salvar</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
