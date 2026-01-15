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
import { Loader2, ArrowLeft, ChevronRight, ChevronLeft, Check, Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { LAYOUT_PRESETS, LayoutType } from "@/types/landingTheme";
import { formatNumber, parseFormattedNumber } from "@/utils/formatNumbers";
import {
  PROFILE_CATEGORIES,
  CATEGORIES_BY_PROFILE_TYPE,
  PRICING_FIELDS_BY_TYPE,
  EXTRA_FIELDS_BY_TYPE,
  ProfileType
} from "@/types/profileTypes";

// Helper function to safely parse numbers
const parseNumber = (value: string | number | null | undefined) => {
  if (!value) return null;
  if (typeof value === 'number') return value;
  return parseFormattedNumber(value.toString());
};

// Format currency value for display (e.g., "1500" -> "1.500")
const formatCurrencyValue = (value: string | number | undefined): string => {
  if (!value) return '';
  const numValue = typeof value === 'string' ? value.replace(/\./g, '').replace(/[^\d]/g, '') : String(value);
  if (!numValue) return '';
  return parseInt(numValue).toLocaleString('pt-BR');
};

// Handle currency input change - format as user types
const handleCurrencyChange = (
  value: string,
  setter: (formatted: string) => void
) => {
  const rawValue = value.replace(/\./g, '').replace(/[^\d]/g, '');
  if (!rawValue) {
    setter('');
    return;
  }
  const formatted = parseInt(rawValue).toLocaleString('pt-BR');
  setter(formatted);
};

export default function CreatorForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(() => {
    // Restore step from localStorage
    if (!id) {
      const saved = localStorage.getItem('creatorFormStep');
      return saved ? parseInt(saved) : 1;
    }
    return 1;
  });

  // Storage key for form persistence (different for new vs edit)
  const STORAGE_KEY = id ? `creatorForm_${id}` : 'creatorFormDraft';

  // Initialize formData from localStorage if available (for new creators only)
  const getInitialFormData = () => {
    if (!id) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, use defaults
        }
      }
    }
    return null;
  };

  const savedData = getInitialFormData();

  const [formData, setFormData] = useState(savedData || {
    profile_type: "influencer" as ProfileType,
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
    // Extra fields for different profile types
    company: "", // Veículo, Emissora, Agência
    program_name: "", // Programa, Coluna, Podcast
    reach: "", // Alcance/Audiência
    // Admin-only metadata
    admin_metadata: {
      sexual_orientation: "",
      promoted_betting: false,
      age: "",
      male_audience_percent: "",
      female_audience_percent: "",
      audience_age_ranges: "",
      ideology: "",
      // Pricing info (admin-only)
      price_story: "",
      price_reels: "",
      price_feed_post: "",
      price_carousel: "",
      price_tiktok_simple: "",
      price_tiktok_produced: "",
      price_youtube_mention: "",
      price_youtube_dedicated: "",
      price_package_basic: "",
      price_package_premium: "",
      pricing_notes: "",
      // Dynamic pricing list for other services (press, etc)
      custom_prices: [] as { label: string; price: string }[],
    },
  });

  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);
  const [platformSettings, setPlatformSettings] = useState<any[]>([]);

  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  // This follows React's Rules of Hooks

  // Auto-save form data to localStorage (only for new creators)
  useEffect(() => {
    if (!id && formData.name) {
      // Only save if there's some data entered
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      localStorage.setItem('creatorFormStep', String(currentStep));
    }
  }, [formData, currentStep, id, STORAGE_KEY]);

  // Clear saved data function (call after successful save)
  const clearSavedFormData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('creatorFormStep');
  };

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
          profile_type: "influencer" as ProfileType,
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
          company: "",
          program_name: "",
          reach: "",
          admin_metadata: {
            sexual_orientation: "",
            promoted_betting: false,
            age: "",
            male_audience_percent: "",
            female_audience_percent: "",
            audience_age_ranges: "",
            ideology: "",
            // Pricing
            price_story: "",
            price_reels: "",
            price_feed_post: "",
            price_carousel: "",
            price_tiktok_simple: "",
            price_tiktok_produced: "",
            price_youtube_mention: "",
            price_youtube_dedicated: "",
            price_package_basic: "",
            price_package_premium: "",
            pricing_notes: "",
            custom_prices: [],
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

    // Helper to format numbers from DB for display
    const formatForDisplay = (val: any) => {
      if (!val && val !== 0) return '';
      const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d]/g, ''));
      if (isNaN(num)) return '';
      return num.toLocaleString('pt-BR');
    };

    setFormData({
      profile_type: creator.profile_type || "influencer",
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
      // Format numbers from DB for display
      instagram_followers: formatForDisplay(creator.instagram_followers),
      tiktok_followers: formatForDisplay(creator.tiktok_followers),
      youtube_subscribers: formatForDisplay(creator.youtube_subscribers),
      twitter_followers: formatForDisplay(creator.twitter_followers),
      kwai_followers: formatForDisplay(creator.kwai_followers),
      engagement_rate: formatForDisplay(creator.engagement_rate),
      stories_views: formatForDisplay(creator.stories_views),
      gallery_urls: creator.gallery_urls || [],
      phone: creator.phone || "",
      primary_platform: creator.primary_platform || "",
      company: creator.company || "",
      program_name: creator.program_name || "",
      reach: creator.reach || "",
      admin_metadata: {
        sexual_orientation: creator.admin_metadata?.sexual_orientation || "",
        promoted_betting: creator.admin_metadata?.promoted_betting || false,
        age: creator.admin_metadata?.age || "",
        male_audience_percent: creator.admin_metadata?.male_audience_percent || "",
        female_audience_percent: creator.admin_metadata?.female_audience_percent || "",
        audience_age_ranges: creator.admin_metadata?.audience_age_ranges || "",
        ideology: creator.admin_metadata?.ideology || "",
        // Pricing - format for display
        price_story: creator.admin_metadata?.price_story || "",
        price_reels: creator.admin_metadata?.price_reels || "",
        price_feed_post: creator.admin_metadata?.price_feed_post || "",
        price_carousel: creator.admin_metadata?.price_carousel || "",
        price_tiktok_simple: creator.admin_metadata?.price_tiktok_simple || "",
        price_tiktok_produced: creator.admin_metadata?.price_tiktok_produced || "",
        price_youtube_mention: creator.admin_metadata?.price_youtube_mention || "",
        price_youtube_dedicated: creator.admin_metadata?.price_youtube_dedicated || "",
        price_package_basic: creator.admin_metadata?.price_package_basic || "",
        price_package_premium: creator.admin_metadata?.price_package_premium || "",
        pricing_notes: creator.admin_metadata?.pricing_notes || "",
        custom_prices: creator.admin_metadata?.custom_prices || [],
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
        profile_type: formData.profile_type,
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
        engagement_rate: parseNumber(formData.engagement_rate),
        stories_views: parseNumber(formData.stories_views),
        background_image_url: formData.background_image_url,
        gallery_urls: formData.gallery_urls,
        phone: formData.phone,
        primary_platform: formData.primary_platform,
        // Extra fields for different profile types
        company: formData.company,
        program_name: formData.program_name,
        reach: formData.reach,
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

      // Clear saved form data from localStorage after successful save
      clearSavedFormData();

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

                {/* Profile Type Selector - Admin Only */}
                {isAdmin && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Tipo de Perfil</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {PROFILE_CATEGORIES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, profile_type: type.id, category: '' })}
                          className={`
                            p-3 rounded-xl border-2 transition-all text-left
                            ${formData.profile_type === type.id
                              ? 'border-accent bg-accent/10 shadow-lg'
                              : 'border-white/10 hover:border-white/30 bg-black/20'
                            }
                          `}
                        >
                          <span className="text-2xl block mb-1">{type.icon}</span>
                          <span className="text-sm font-medium block">{type.label}</span>
                          <span className="text-xs text-muted-foreground block truncate">{type.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <ImageUpload
                  currentImage={formData.image_url}
                  onImageUploaded={(url) => setFormData({ ...formData, image_url: url as string })}
                  label="Foto de Perfil"
                />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: João Silva" />
                  </div>

                  {isAdmin ? (
                    /* Admin: Ask for Instagram @ instead of custom slug */
                    <div className="space-y-2">
                      <Label>@ do Instagram</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap bg-white/5 px-2 py-2 rounded-md border border-white/10">@</span>
                        <Input
                          value={formData.instagram_url?.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '') || formData.slug}
                          onChange={e => {
                            const handle = e.target.value.replace('@', '').toLowerCase();
                            setFormData({
                              ...formData,
                              slug: handle,
                              instagram_url: handle ? `https://instagram.com/${handle}` : '',
                              instagram_active: handle ? true : formData.instagram_active
                            });
                          }}
                          placeholder="ex: joaosilva"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Digite o @ do Instagram. O slug e URL do Instagram serão gerados automaticamente.
                      </p>
                    </div>
                  ) : (
                    /* Non-admin: Show custom slug field */
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
                  )}

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Selecione uma categoria...</option>
                      {CATEGORIES_BY_PROFILE_TYPE[formData.profile_type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Extra Fields based on Profile Type */}
                  {isAdmin && EXTRA_FIELDS_BY_TYPE[formData.profile_type].company && (
                    <div className="space-y-2">
                      <Label>{EXTRA_FIELDS_BY_TYPE[formData.profile_type].company}</Label>
                      <Input
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        placeholder={`Ex: ${formData.profile_type === 'press' ? 'Folha de S.Paulo' : formData.profile_type === 'tv' ? 'TV Globo' : 'Nome da empresa'}`}
                      />
                    </div>
                  )}

                  {isAdmin && EXTRA_FIELDS_BY_TYPE[formData.profile_type].program && (
                    <div className="space-y-2">
                      <Label>{EXTRA_FIELDS_BY_TYPE[formData.profile_type].program}</Label>
                      <Input
                        value={formData.program_name}
                        onChange={e => setFormData({ ...formData, program_name: e.target.value })}
                        placeholder={`Ex: ${formData.profile_type === 'press' ? 'Coluna Gente' : formData.profile_type === 'tv' ? 'Jornal Nacional' : formData.profile_type === 'podcast' ? 'Flow Podcast' : 'Nome do programa'}`}
                      />
                    </div>
                  )}

                  {isAdmin && EXTRA_FIELDS_BY_TYPE[formData.profile_type].reach && (
                    <div className="space-y-2">
                      <Label>{EXTRA_FIELDS_BY_TYPE[formData.profile_type].reach}</Label>
                      <Input
                        value={formData.reach}
                        onChange={e => setFormData({ ...formData, reach: e.target.value })}
                        placeholder="Ex: 500.000"
                      />
                    </div>
                  )}

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
                {/* Admin: Pricing Step */}
                {isAdmin ? (
                  <>
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold mb-2">💰 Preços</h1>
                      <p className="text-white/60 text-sm">Valores cobrados pelo perfil</p>
                    </div>

                    {/* Dynamic Pricing based on selected social networks */}
                    <div className="space-y-4">

                      {/* Instagram Pricing */}
                      {formData.instagram_active && (
                        <div className="p-4 glass rounded-xl border border-pink-500/20">
                          <h3 className="font-medium text-pink-400 mb-4 flex items-center gap-2">
                            <span>📷</span> Instagram
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Story (1x)</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                                <Input
                                  value={formatCurrencyValue(formData.admin_metadata.price_story)}
                                  onChange={(e) => handleCurrencyChange(e.target.value, (v) => setFormData({
                                    ...formData,
                                    admin_metadata: { ...formData.admin_metadata, price_story: v }
                                  }))}
                                  placeholder="500"
                                  className="bg-black/20 pl-8 h-9 text-sm"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Reels</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                                <Input
                                  value={formatCurrencyValue(formData.admin_metadata.price_reels)}
                                  onChange={(e) => handleCurrencyChange(e.target.value, (v) => setFormData({
                                    ...formData,
                                    admin_metadata: { ...formData.admin_metadata, price_reels: v }
                                  }))}
                                  placeholder="1.500"
                                  className="bg-black/20 pl-8 h-9 text-sm"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Post Feed</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                                <Input
                                  value={formatCurrencyValue(formData.admin_metadata.price_feed_post)}
                                  onChange={(e) => handleCurrencyChange(e.target.value, (v) => setFormData({
                                    ...formData,
                                    admin_metadata: { ...formData.admin_metadata, price_feed_post: v }
                                  }))}
                                  placeholder="2.000"
                                  className="bg-black/20 pl-8 h-9 text-sm"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Carrossel</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                                <Input
                                  value={formatCurrencyValue((formData.admin_metadata as any).price_carousel || '')}
                                  onChange={(e) => handleCurrencyChange(e.target.value, (v) => setFormData({
                                    ...formData,
                                    admin_metadata: { ...formData.admin_metadata, price_carousel: v }
                                  }))}
                                  placeholder="2.500"
                                  className="bg-black/20 pl-8 h-9 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TikTok Pricing */}
                      {formData.tiktok_active && (
                        <div className="p-4 glass rounded-xl border border-cyan-500/20">
                          <h3 className="font-medium text-cyan-400 mb-4 flex items-center gap-2">
                            <span>🎵</span> TikTok
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Vídeo Simples</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                                <Input
                                  value={formatCurrencyValue((formData.admin_metadata as any).price_tiktok_simple || '')}
                                  onChange={(e) => handleCurrencyChange(e.target.value, (v) => setFormData({
                                    ...formData,
                                    admin_metadata: { ...formData.admin_metadata, price_tiktok_simple: v }
                                  }))}
                                  placeholder="800"
                                  className="bg-black/20 pl-8 h-9 text-sm"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Vídeo Produzido</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                                <Input
                                  value={formatCurrencyValue((formData.admin_metadata as any).price_tiktok_produced || '')}
                                  onChange={(e) => handleCurrencyChange(e.target.value, (v) => setFormData({
                                    ...formData,
                                    admin_metadata: { ...formData.admin_metadata, price_tiktok_produced: v }
                                  }))}
                                  placeholder="2.500"
                                  className="bg-black/20 pl-8 h-9 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* YouTube Pricing */}
                      {formData.youtube_active && (
                        <div className="p-4 glass rounded-xl border border-red-500/20">
                          <h3 className="font-medium text-red-400 mb-4 flex items-center gap-2">
                            <span>▶️</span> YouTube
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Menção</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                                <Input
                                  value={formatCurrencyValue((formData.admin_metadata as any).price_youtube_mention || '')}
                                  onChange={(e) => handleCurrencyChange(e.target.value, (v) => setFormData({
                                    ...formData,
                                    admin_metadata: { ...formData.admin_metadata, price_youtube_mention: v }
                                  }))}
                                  placeholder="3.000"
                                  className="bg-black/20 pl-8 h-9 text-sm"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Vídeo Dedicado</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                                <Input
                                  value={formatCurrencyValue((formData.admin_metadata as any).price_youtube_dedicated || '')}
                                  onChange={(e) => handleCurrencyChange(e.target.value, (v) => setFormData({
                                    ...formData,
                                    admin_metadata: { ...formData.admin_metadata, price_youtube_dedicated: v }
                                  }))}
                                  placeholder="10.000"
                                  className="bg-black/20 pl-8 h-9 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* No networks selected message */}
                      {!formData.instagram_active && !formData.tiktok_active && !formData.youtube_active && !formData.twitter_active && !formData.kwai_active && (
                        <div className="p-6 glass rounded-xl border border-dashed border-white/20 text-center">
                          <p className="text-muted-foreground text-sm">
                            Nenhuma rede social ativada. Volte e ative ao menos uma rede para definir preços.
                          </p>
                        </div>
                      )}

                      {/* Packages */}
                      <div className="p-4 glass rounded-xl border border-accent/20">
                        <h3 className="font-medium text-accent mb-4 flex items-center gap-2">
                          <span>📦</span> Pacotes
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Pacote Básico</Label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                              <Input
                                value={formatCurrencyValue(formData.admin_metadata.price_package_basic)}
                                onChange={(e) => handleCurrencyChange(e.target.value, (v) => setFormData({
                                  ...formData,
                                  admin_metadata: { ...formData.admin_metadata, price_package_basic: v }
                                }))}
                                placeholder="3.000"
                                className="bg-black/20 pl-8 h-9 text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Pacote Premium</Label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                              <Input
                                value={formatCurrencyValue(formData.admin_metadata.price_package_premium)}
                                onChange={(e) => handleCurrencyChange(e.target.value, (v) => setFormData({
                                  ...formData,
                                  admin_metadata: { ...formData.admin_metadata, price_package_premium: v }
                                }))}
                                placeholder="8.000"
                                className="bg-black/20 pl-8 h-9 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>



                      {/* Notes */}
                      <div className="space-y-2">
                        <Label className="text-xs">📝 Observações</Label>
                        <Textarea
                          value={formData.admin_metadata.pricing_notes}
                          onChange={(e) => setFormData({
                            ...formData,
                            admin_metadata: { ...formData.admin_metadata, pricing_notes: e.target.value }
                          })}
                          placeholder="Aceita permuta, negocia valores, cobra extra por exclusividade..."
                          rows={2}
                          className="bg-black/20 text-sm"
                        />
                      </div>

                      {/* Admin Metadata - Collapsible */}
                      <details className="group">
                        <summary className="cursor-pointer p-3 glass rounded-xl border border-orange-500/20 flex items-center justify-between">
                          <span className="text-sm font-medium text-orange-400">🔒 Metadados Privados</span>
                          <ChevronRight className="w-4 h-4 text-orange-400 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="mt-2 p-4 glass rounded-xl border border-orange-500/10 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Idade</Label>
                            <Input
                              type="number"
                              value={formData.admin_metadata.age}
                              onChange={(e) => setFormData({
                                ...formData,
                                admin_metadata: { ...formData.admin_metadata, age: e.target.value }
                              })}
                              placeholder="25"
                              className="bg-black/20 h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Orientação</Label>
                            <select
                              value={formData.admin_metadata.sexual_orientation}
                              onChange={(e) => setFormData({
                                ...formData,
                                admin_metadata: { ...formData.admin_metadata, sexual_orientation: e.target.value }
                              })}
                              className="w-full h-9 px-2 bg-black/20 border border-white/10 rounded-lg text-sm"
                            >
                              <option value="">-</option>
                              <option value="heterossexual">Hetero</option>
                              <option value="homossexual">Homo</option>
                              <option value="bissexual">Bi</option>
                              <option value="outro">Outro</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">% Masc.</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={formData.admin_metadata.male_audience_percent}
                              onChange={(e) => setFormData({
                                ...formData,
                                admin_metadata: { ...formData.admin_metadata, male_audience_percent: e.target.value }
                              })}
                              placeholder="40"
                              className="bg-black/20 h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">% Fem.</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={formData.admin_metadata.female_audience_percent}
                              onChange={(e) => setFormData({
                                ...formData,
                                admin_metadata: { ...formData.admin_metadata, female_audience_percent: e.target.value }
                              })}
                              placeholder="60"
                              className="bg-black/20 h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-xs flex items-center gap-2">
                              Divulgou Aposta
                              <Switch
                                checked={formData.admin_metadata.promoted_betting}
                                onCheckedChange={(checked) => setFormData({
                                  ...formData,
                                  admin_metadata: { ...formData.admin_metadata, promoted_betting: checked }
                                })}
                              />
                            </Label>
                          </div>
                        </div>
                      </details>
                    </div>
                  </>
                ) : (
                  /* Non-Admin: Personalization Step */
                  <>
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
                                });
                              }}
                              className={`cursor-pointer relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${isSelected ? 'border-accent scale-105 shadow-[0_0_20px_rgba(255,107,53,0.3)]' : 'border-white/10 hover:border-white/30'}`}
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
                  </>
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
