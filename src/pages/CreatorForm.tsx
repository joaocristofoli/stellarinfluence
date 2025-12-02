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
    background_image_url: "",
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
    gallery_urls: [] as string[],
    phone: "",
    primary_platform: "",
    // Admin-only metadata
    admin_metadata: {
      sexual_orientation: "",
      promoted_betting: false,
      age: "",
      male_audience_percent: "",
      female_audience_percent: "",
      audience_age_ranges: "",
      ideology: "",
    },
  });

  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);
  const [platformSettings, setPlatformSettings] = useState<any[]>([]);

  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  // This follows React's Rules of Hooks

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
    // Allow if admin OR if user is authenticated (for self-setup)
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Admin editing a specific creator
    if (isAdmin && id) {
      // Only fetch if this is a different creator than currently loaded
      if (currentEditingId !== id) {
        console.log("🔄 Admin editing creator, ID changed from", currentEditingId, "to", id);
        setLoading(true);
        setCurrentEditingId(id);
        // Reset form to avoid showing stale data
        setFormData({
          name: "",
          slug: "",
          category: "",
          bio: "",
          image_url: "",
          background_image_url: "",
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
          gallery_urls: [],
          phone: "",
          primary_platform: "",
          admin_metadata: {
            sexual_orientation: "",
            promoted_betting: false,
            age: "",
            male_audience_percent: "",
            female_audience_percent: "",
            audience_age_ranges: "",
            ideology: "",
          },
        });
        fetchCreator(id);
      }
    }
    // Non-admin user setting up their own profile
    else if (!isAdmin && user && !id) {
      console.log("👤 Non-admin user setting up profile");
      fetchCreatorByUserId(user.id);
    }
  }, [isAdmin, id]); // Removed 'user' from dependencies to prevent unwanted re-fetches

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('platform_settings').select('*');
      if (data) setPlatformSettings(data);
    };
    fetchSettings();
  }, []);

  // NOW we can have conditional returns AFTER all hooks
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const fetchCreator = async (creatorId: string) => {
    console.log("🔄 Fetching creator with ID:", creatorId);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("id", creatorId)
        .single();

      if (error) throw error;
      if (data) {
        console.log("✅ Loaded creator data:", data.name, "ID:", data.id);
        populateForm(data);
      }
    } catch (error: any) {
      console.error("❌ Error fetching creator:", error);
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
      navigate("/admin");
    } finally {
      setLoading(false);
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

  const populateForm = (creator: any) => {
    console.log("📸 Creator image_url from DB:", creator.image_url);
    const theme = creator.landing_theme as any;
    setFormData({
      name: creator.name || "",
      slug: creator.slug || "",
      category: creator.category || "",
      bio: creator.bio || "",
      image_url: creator.image_url || "",
      background_image_url: creator.background_image_url || "",
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
      layout: (theme?.layout as LayoutType) || "minimal",
      instagram_followers: creator.instagram_followers || "",
      tiktok_followers: creator.tiktok_followers || "",
      youtube_subscribers: creator.youtube_subscribers || "",
      twitter_followers: creator.twitter_followers || "",
      kwai_followers: creator.kwai_followers || "",
      engagement_rate: creator.engagement_rate || "",
      stories_views: creator.stories_views || "",
      gallery_urls: creator.gallery_urls || [],
      phone: creator.phone || "",
      primary_platform: creator.primary_platform || "",
      admin_metadata: {
        sexual_orientation: creator.admin_metadata?.sexual_orientation || "",
        promoted_betting: creator.admin_metadata?.promoted_betting || false,
        age: creator.admin_metadata?.age || "",
        male_audience_percent: creator.admin_metadata?.male_audience_percent || "",
        female_audience_percent: creator.admin_metadata?.female_audience_percent || "",
        audience_age_ranges: creator.admin_metadata?.audience_age_ranges || "",
        ideology: creator.admin_metadata?.ideology || "",
      },
    });
    console.log("📸 Set formData.image_url to:", creator.image_url || "");
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
        background_image_url: formData.background_image_url,
        gallery_urls: formData.gallery_urls,
        phone: formData.phone,
        primary_platform: formData.primary_platform,
        admin_metadata: formData.admin_metadata,
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

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin" /></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin" /></div>;

  // Show loading spinner while fetching specific creator data (admin editing)
  if (loading && isAdmin && id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando perfil do criador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-4 md:px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(isAdmin ? "/admin" : "/creator/dashboard")}>
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
                    <Label>Link Personalizado do seu Perfil</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">seu-site.com/</span>
                      <Input value={formData.slug} onChange={handleSlugChange} placeholder="ex: joao-silva" className="flex-1" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Este será o link único do seu perfil. Use apenas letras minúsculas e hífens.
                    </p>
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
                                const rawValue = e.target.value.replace(/\./g, ''); // Remove dots

                                // Only allow numbers
                                if (rawValue && !/^\d+$/.test(rawValue)) return;

                                // Format with dots while typing
                                const formatted = rawValue ? parseInt(rawValue).toLocaleString('pt-BR') : '';
                                setFormData({ ...formData, [field]: formatted });
                              }}
                              placeholder="Ex: 10.000, 1.500.000"
                              className="bg-black/20 font-mono"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                              {social.id === 'youtube' ? 'Subs' : 'Followers'}
                            </div>
                          </div>
                        </div>

                        {social.id === 'instagram' && (
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                              Visualizações nos Stories
                            </Label>
                            <div className="relative">
                              <Input
                                value={formData.stories_views}
                                onChange={e => {
                                  const rawValue = e.target.value.replace(/\./g, ''); // Remove dots

                                  // Only allow numbers
                                  if (rawValue && !/^\d+$/.test(rawValue)) return;

                                  // Format with dots while typing
                                  const formatted = rawValue ? parseInt(rawValue).toLocaleString('pt-BR') : '';
                                  setFormData({ ...formData, stories_views: formatted });
                                }}
                                placeholder="Ex: 50.000"
                                className="bg-black/20 font-mono"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                Views
                              </div>
                            </div>
                          </div>
                        )}
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
                  <h3 className="font-medium mb-4">Imagem de Fundo do Perfil</h3>
                  <ImageUpload
                    currentImage={formData.background_image_url}
                    onImageUploaded={(url) => setFormData({ ...formData, background_image_url: url as string })}
                    label="Imagem de Fundo"
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta imagem aparecerá como fundo na sua página de perfil.
                  </p>
                </div>

                <div className="space-y-4 p-4 md:p-6 glass rounded-xl">
                  <h3 className="font-medium mb-4">Galeria de Fotos</h3>
                  <ImageUpload
                    currentImage={formData.gallery_urls.join(',')}
                    onImageUploaded={(urls) => {
                      const urlArray = Array.isArray(urls) ? urls : [urls];
                      setFormData({ ...formData, gallery_urls: urlArray });
                    }}
                    label="Fotos da Galeria (até 6)"
                    multiple={true}
                    maxFiles={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Selecione até 6 fotos para a galeria do seu perfil.
                  </p>
                  {formData.gallery_urls.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-xs">Fotos Selecionadas ({formData.gallery_urls.length}/6)</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {formData.gallery_urls.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => {
                                const newUrls = formData.gallery_urls.filter((_, i) => i !== idx);
                                setFormData({ ...formData, gallery_urls: newUrls });
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin-Only Metadata Section */}
                {isAdmin && (
                  <div className="mt-8 p-6 rounded-lg border-2 border-orange-500/30 bg-orange-500/5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      <h3 className="font-bold text-orange-500 uppercase tracking-wider text-sm">
                        Informações Privadas (Apenas Admin)
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6">
                      Estes campos são completament invisíveis para o criador e servem apenas para filtros internos.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sexual Orientation */}
                      <div className="space-y-2">
                        <Label className="text-xs">Orientação Sexual</Label>
                        <select
                          value={formData.admin_metadata.sexual_orientation}
                          onChange={(e) => setFormData({
                            ...formData,
                            admin_metadata: {
                              ...formData.admin_metadata,
                              sexual_orientation: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm"
                        >
                          <option value="">Não informado</option>
                          <option value="heterossexual">Heterossexual</option>
                          <option value="homossexual">Homossexual</option>
                          <option value="bissexual">Bissexual</option>
                          <option value="outro">Outro</option>
                          <option value="prefere_nao_informar">Prefere não informar</option>
                        </select>
                      </div>

                      {/* Age */}
                      <div className="space-y-2">
                        <Label className="text-xs">Idade</Label>
                        <Input
                          type="number"
                          value={formData.admin_metadata.age}
                          onChange={(e) => setFormData({
                            ...formData,
                            admin_metadata: {
                              ...formData.admin_metadata,
                              age: e.target.value
                            }
                          })}
                          placeholder="Ex: 25"
                          className="bg-black/20"
                        />
                      </div>

                      {/* Promoted Betting */}
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-2">
                          <span>Divulgou Aposta</span>
                        </Label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-black/20 border border-white/10 rounded-lg">
                          <Switch
                            checked={formData.admin_metadata.promoted_betting}
                            onCheckedChange={(checked) => setFormData({
                              ...formData,
                              admin_metadata: {
                                ...formData.admin_metadata,
                                promoted_betting: checked
                              }
                            })}
                          />
                          <span className="text-sm">
                            {formData.admin_metadata.promoted_betting ? "Sim" : "Não"}
                          </span>
                        </div>
                      </div>

                      {/* Ideology */}
                      <div className="space-y-2">
                        <Label className="text-xs">Ideologia</Label>
                        <select
                          value={formData.admin_metadata.ideology}
                          onChange={(e) => setFormData({
                            ...formData,
                            admin_metadata: {
                              ...formData.admin_metadata,
                              ideology: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm"
                        >
                          <option value="">Não informado</option>
                          <option value="esquerda">Esquerda</option>
                          <option value="centro-esquerda">Centro-Esquerda</option>
                          <option value="centro">Centro</option>
                          <option value="centro-direita">Centro-Direita</option>
                          <option value="direita">Direita</option>
                          <option value="outro">Outro</option>
                          <option value="nao_se_aplica">Não se aplica</option>
                        </select>
                      </div>

                      {/* Male Audience % */}
                      <div className="space-y-2">
                        <Label className="text-xs">Público Masculino (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.admin_metadata.male_audience_percent}
                          onChange={(e) => setFormData({
                            ...formData,
                            admin_metadata: {
                              ...formData.admin_metadata,
                              male_audience_percent: e.target.value
                            }
                          })}
                          placeholder="Ex: 65"
                          className="bg-black/20"
                        />
                      </div>

                      {/* Female Audience % */}
                      <div className="space-y-2">
                        <Label className="text-xs">Público Feminino (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.admin_metadata.female_audience_percent}
                          onChange={(e) => setFormData({
                            ...formData,
                            admin_metadata: {
                              ...formData.admin_metadata,
                              female_audience_percent: e.target.value
                            }
                          })}
                          placeholder="Ex: 35"
                          className="bg-black/20"
                        />
                      </div>

                      {/* Audience Age Ranges */}
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs">Faixas Etárias do Público</Label>
                        <Input
                          value={formData.admin_metadata.audience_age_ranges}
                          onChange={(e) => setFormData({
                            ...formData,
                            admin_metadata: {
                              ...formData.admin_metadata,
                              audience_age_ranges: e.target.value
                            }
                          })}
                          placeholder="Ex: 13-17, 18-24, 25-34"
                          className="bg-black/20"
                        />
                        <p className="text-xs text-muted-foreground">
                          Separe as faixas por vírgula. Ex: 13-17, 18-24, 25-34, 35-44, 45+
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
