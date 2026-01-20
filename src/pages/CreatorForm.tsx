import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ChevronRight, ChevronLeft, Check } from "lucide-react";
import {
  BasicInfoStep,
  SocialStep,
  MediaStep,
  PricingStep,
  ReviewStep,
  useDuplicateDetection
} from "./creator-form";
import { CreatorFormData, initialFormData } from "@/types/creatorForm";
import { ProfileType } from "@/types/profileTypes";
import { parseFormattedNumber } from "@/utils/formatNumbers";

export default function CreatorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Duplicate Detection
  const { duplicates, checkDuplicate, clearDuplicates } = useDuplicateDetection();

  // Determine total steps based on user role
  const TOTAL_STEPS = isAdmin ? 5 : 4;

  // Step Management
  const [currentStep, setCurrentStep] = useState(() => {
    if (!id) {
      const saved = localStorage.getItem('creatorFormStep');
      return saved ? parseInt(saved) : 1;
    }
    return 1;
  });

  const STORAGE_KEY = id ? `creatorForm_${id}` : 'creatorFormDraft';

  const [formData, setFormData] = useState<CreatorFormData>(initialFormData);
  const [platformSettings, setPlatformSettings] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial Data Loading
  useEffect(() => {
    const loadData = async () => {
      if (id && isAdmin) {
        await fetchCreator(id);
      } else if (!id && !isAdmin && user) {
        // Check if user already has a profile
        await fetchCreatorByUserId(user.id);
      } else if (!id) {
        // Load from local storage for new drafts
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setFormData({ ...initialFormData, ...parsed }); // Merge with initial to ensure new fields exists
          } catch (e) {
            console.error("Error parsing saved draft", e);
          }
        }
      }
    };

    if (!authLoading && user) {
      loadData();
    }
  }, [id, isAdmin, user, authLoading]);

  // Save draft
  useEffect(() => {
    if (!id && formData.name) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      localStorage.setItem('creatorFormStep', String(currentStep));
    }
  }, [formData, currentStep, id]);

  // Fetch Platform Settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('platform_settings').select('*');
      if (data) setPlatformSettings(data);
    };
    fetchSettings();
  }, []);

  const fetchCreator = async (creatorId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("creators").select("*").eq("id", creatorId).single();
      if (error) throw error;
      if (data) populateForm(data);
    } catch (error: any) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorByUserId = async (userId: string) => {
    setLoading(true);
    try {
      const { data } = await supabase.from("creators").select("*").eq("user_id", userId).maybeSingle();
      if (data) populateForm(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const populateForm = (data: any) => {
    setFormData({
      ...initialFormData,
      ...data,
      profile_type: (data.profile_type as ProfileType) || 'influencer',
      // Ensure arrays are arrays
      gallery_urls: data.gallery_urls || [],
      music_preferences: data.music_preferences || [],
      content_genres: data.content_genres || [],
      // Ensure admin metadata structure
      admin_metadata: {
        ...initialFormData.admin_metadata,
        ...data.admin_metadata
      }
    });
  };

  const handleDuplicateCheck = async () => {
    if (formData.instagram_url) {
      await checkDuplicate(formData.instagram_url, id);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate Step 1
      if (!formData.name) {
        toast({ title: "Campo Obrigatório", description: "Por favor, informe o nome.", variant: "destructive" });
        return;
      }
      if (!formData.profile_type && isAdmin) {
        toast({ title: "Campo Obrigatório", description: "Selecione o tipo de perfil.", variant: "destructive" });
        return;
      }
      // Check duplicates
      await handleDuplicateCheck();
      // We don't block, just warn. Warning is shown in BasicInfoStep.
    }
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Jump to step for editing
  const goToStep = (step: number) => setCurrentStep(step);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Generate Slug if missing
      let finalSlug = formData.slug;
      if (!finalSlug && formData.name) {
        finalSlug = formData.name.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }

      if (!finalSlug) throw new Error("Slug é obrigatório");

      // Prepare payload
      // FIX: Calculate total_followers from platform followers
      const totalFollowers = (
        parseFormattedNumber(formData.instagram_followers || '0') +
        parseFormattedNumber(formData.youtube_subscribers || '0') +
        parseFormattedNumber(formData.tiktok_followers || '0') +
        parseFormattedNumber(formData.twitter_followers || '0') +
        parseFormattedNumber(formData.kwai_followers || '0')
      );

      const payload = {
        ...formData,
        slug: finalSlug,
        // FIX: Set total_followers as formatted string
        total_followers: totalFollowers > 0 ? totalFollowers.toString() : '0',
        // Parse numbers for DB
        instagram_followers: parseFormattedNumber(formData.instagram_followers || '0'),
        tiktok_followers: parseFormattedNumber(formData.tiktok_followers || '0'),
        youtube_subscribers: parseFormattedNumber(formData.youtube_subscribers || '0'),
        twitter_followers: parseFormattedNumber(formData.twitter_followers || '0'),
        kwai_followers: parseFormattedNumber(formData.kwai_followers || '0'),
        // Keep these as strings to match DB schema
        engagement_rate: formData.engagement_rate || '',
        stories_views: formData.stories_views || '',

        // Add approval status for new creators (self-signup)
        ...(!id && !isAdmin && { approval_status: 'pending' }),

        // User ID linkage
        ...(!isAdmin && { user_id: user?.id })
      };

      let error;
      if (id) {
        const { error: reqError } = await supabase.from("creators").update(payload).eq("id", id);
        error = reqError;
      } else {
        const { error: reqError } = await supabase.from("creators").insert(payload);
        error = reqError;
      }

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Perfil salvo com sucesso." });

      // Clear draft
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('creatorFormStep');

      navigate(isAdmin ? "/admin" : "/creator/dashboard");

    } catch (error: any) {
      console.error("Submit Error:", error);
      // Handle Unique Constraint Violations
      if (error.code === '23505') {
        if (error.message?.includes('instagram')) {
          toast({ title: "Duplicidade", description: "Este Instagram já está cadastrado no sistema.", variant: "destructive" });
        } else if (error.message?.includes('slug')) {
          toast({ title: "URL Indisponível", description: "Este slug/link já está em uso.", variant: "destructive" });
        } else {
          toast({ title: "Erro de Duplicidade", description: "Este registro já existe.", variant: "destructive" });
        }
      } else {
        toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (loading && isAdmin)) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20 font-inter">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-4 md:px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(isAdmin ? "/admin" : "/creator/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Voltar</span>
        </Button>

        <div className="flex items-center gap-2 sm:gap-4">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            const step = i + 1;
            return (
              <div key={step} className="flex items-center">
                <div
                  className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                        ${step === currentStep ? 'bg-accent text-white scale-110 shadow-lg shadow-accent/25' :
                      step < currentStep ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        'bg-white/5 text-muted-foreground border border-white/10'}
                                    `}
                >
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < TOTAL_STEPS && (
                  <div className={`w-4 sm:w-8 h-[2px] mx-1 sm:mx-2 rounded-full ${step < currentStep ? 'bg-green-500/30' : 'bg-white/5'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="w-20" /> {/* Spacer */}
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 1 && (
              <BasicInfoStep
                formData={formData}
                setFormData={setFormData}
                isAdmin={isAdmin}
                duplicates={duplicates}
                onIgnoreDuplicate={() => clearDuplicates()}
                onMerge={() => console.log('Merge requested')}
                onValidationCheck={handleDuplicateCheck}
              />
            )}
            {currentStep === 2 && (
              <SocialStep
                formData={formData}
                setFormData={setFormData}
                platformSettings={platformSettings}
              />
            )}
            {currentStep === 3 && (
              <MediaStep
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {/* Admin Step 4: Pricing */}
            {currentStep === 4 && isAdmin && (
              <PricingStep
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {/* User Step 4 or Admin Step 5: Review */}
            {((!isAdmin && currentStep === 4) || (isAdmin && currentStep === 5)) && (
              <ReviewStep
                formData={formData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onEditStep={goToStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-white/10 z-50">
        <div className="max-w-3xl mx-auto flex justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSubmitting}
            className="text-muted-foreground hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className={`${currentStep === TOTAL_STEPS ? 'hidden' : 'flex'
              } bg-accent hover:bg-accent/90 text-white min-w-[140px]`}
          >
            Próximo <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
