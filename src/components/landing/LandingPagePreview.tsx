import * as React from "react";
import { LandingTheme, getOrderedSections } from "@/types/landingTheme";
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, AnimatePresence } from "framer-motion";

// --- Helper Components ---

import { ThemeBackground } from "@/components/ui/ThemeBackground";
import { ScrollIndicator } from "@/components/landing/ScrollIndicator";
import { LuxuryOverlay } from "@/components/ui/LuxuryOverlay";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Counter } from "@/components/ui/Counter";
import { Instagram, Youtube, Video, Twitter, ArrowRight, ExternalLink, Crown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareProfileDialog } from "@/components/ShareProfileDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlatformSetting {
    platform: string;
    icon_url: string | null;
    bg_color: string | null;
    is_transparent: boolean;
    use_theme_color: boolean;
}

// 2. Scroll Reveal Container (Optimized - Forced Visibility)
const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
};

// 3. Parallax Text
const ParallaxText = ({ children, speed = 1 }: { children: React.ReactNode; speed?: number }) => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50 * speed]); // Reduced range for stability
    return <motion.div style={{ y }}>{children}</motion.div>;
};

// 4. Cycling Stats Component (Embla Carousel)
import useEmblaCarousel from 'embla-carousel-react';

const CyclingStats = ({ creatorData, theme, platformSettings = [] }: { creatorData: any, theme: LandingTheme, platformSettings?: PlatformSetting[] }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'center',
        skipSnaps: false,
        dragFree: false
    });
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    // Base platforms list
    const platforms = [
        { key: 'instagram', label: 'Instagram', color: '#E1306C', value: creatorData?.instagram_followers, icon: Instagram, url: creatorData?.instagram_url },
        { key: 'youtube', label: 'YouTube', color: '#FF0000', value: creatorData?.youtube_subscribers, icon: Youtube, url: creatorData?.youtube_url },
        { key: 'tiktok', label: 'TikTok', color: '#00F2EA', value: creatorData?.tiktok_followers, icon: Video, url: creatorData?.tiktok_url },
        { key: 'twitter', label: 'Twitter', color: '#1DA1F2', value: creatorData?.twitter_followers, icon: Twitter, url: creatorData?.twitter_url },
        { key: 'kwai', label: 'Kwai', color: '#FF8F00', value: creatorData?.kwai_followers, icon: Video, url: creatorData?.kwai_url },
    ].filter(p => {
        const isActive = creatorData?.[`${p.key}_active`];
        return p.value && isActive !== false;
    }).sort((a, b) => {
        // Keep primary first
        if (creatorData?.primary_platform === a.key) return -1;
        if (creatorData?.primary_platform === b.key) return 1;
        return 0;
    });

    const onSelect = React.useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    React.useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    if (platforms.length === 0) return null;

    return (
        <div className="w-full relative py-12 overflow-visible">
            {/* Increased py-12 and overflow-visible to prevent shadow clipping */}
            <div className="overflow-visible" ref={emblaRef}>
                <div className="flex touch-pan-y gap-6">
                    {/* Removed pl-4, increased gap to 6 */}
                    {platforms.map((current, index) => {
                        const isActive = selectedIndex === index;
                        const isPrimary = creatorData?.primary_platform === current.key;
                        const setting = platformSettings.find(s => s.platform === current.key);

                        // Styles
                        const isTransparent = setting?.is_transparent;
                        const useThemeColor = setting?.use_theme_color ?? true;

                        // Use theme colors more strictly
                        const bubbleBg = isTransparent ? 'transparent' :
                            useThemeColor ? theme.textColor :
                                (setting?.bg_color || 'transparent');

                        const iconColor = isTransparent ? current.color :
                            useThemeColor ? theme.backgroundColor : '#ffffff';

                        // Handle extraction
                        let handle = '@perfil';
                        if (current.url) {
                            try {
                                const urlObj = new URL(current.url.startsWith('http') ? current.url : `https://${current.url}`);
                                const pathParts = urlObj.pathname.split('/').filter(Boolean);
                                if (pathParts.length > 0) handle = `@${pathParts[pathParts.length - 1]}`;
                            } catch (e) { handle = '@perfil'; }
                        }

                        // Dynamic colors based on theme for better visibility
                        const handleBg = theme.textColor === '#ffffff' || theme.textColor === '#fff'
                            ? 'rgba(255, 255, 255, 0.1)' // White text (Dark theme) -> White glass
                            : 'rgba(0, 0, 0, 0.05)';     // Black text (Light theme) -> Black glass

                        const cardBorder = theme.textColor === '#ffffff' || theme.textColor === '#fff'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.1)';

                        return (
                            <div className="flex-[0_0_auto] min-w-0" key={current.key}>
                                {/* Wrapper with fixed maximum size to prevent layout thrashing */}
                                <div className="w-[280px] h-[340px] md:w-[320px] md:h-[400px] flex items-center justify-center transition-all duration-500">
                                    <a
                                        href={current.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`relative w-full h-full flex flex-col items-center justify-between p-6 rounded-[2rem] cursor-pointer overflow-hidden transition-all duration-500 ease-out
                                            ${isActive ? 'scale-100 opacity-100 grayscale-0 blur-0 z-20' : 'scale-90 opacity-50 grayscale-[0.8] blur-[1px] z-10'}
                                        `}
                                        style={{
                                            backgroundColor: isActive ? `${theme.secondaryColor}40` : 'rgba(255,255,255,0.05)',
                                            backdropFilter: 'blur(20px)',
                                            border: `1px solid ${isActive ? current.color : cardBorder}`,
                                            boxShadow: isActive ? `0 20px 50px -10px ${current.color}40` : 'none',
                                        }}
                                    >
                                        {/* Glow Effect */}
                                        {isActive && (
                                            <div
                                                className="absolute inset-0 opacity-20 pointer-events-none"
                                                style={{ background: `radial-gradient(circle at center, ${current.color}, transparent 70%)` }}
                                            />
                                        )}

                                        {/* Crown for Primary */}
                                        {isPrimary && (
                                            <div className="absolute -top-1 -right-1 z-30">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-yellow-500 blur-md opacity-50" />
                                                    <div className="relative bg-gradient-to-br from-yellow-300 to-yellow-600 p-2 rounded-bl-2xl rounded-tr-2xl shadow-lg border border-yellow-200/50">
                                                        <Crown className="w-5 h-5 text-white fill-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Top: Icon */}
                                        <div className="relative z-10 mt-4">
                                            <div
                                                className={`rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'w-20 h-20 md:w-24 md:h-24 shadow-lg' : 'w-16 h-16 md:w-20 md:h-20'}`}
                                                style={{ backgroundColor: bubbleBg }}
                                            >
                                                {setting?.icon_url ? (
                                                    <img src={setting.icon_url} alt={current.label} className={`${isActive ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-10 md:h-10'} object-contain`} />
                                                ) : (
                                                    <current.icon className={`${isActive ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-10 md:h-10'}`} style={{ color: iconColor }} />
                                                )}
                                            </div>
                                        </div>

                                        {/* Middle: Count */}
                                        <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                                            <h3
                                                className={`font-black tracking-tighter transition-all duration-500 ${isActive ? 'text-5xl md:text-7xl' : 'text-4xl md:text-5xl'}`}
                                                style={{ color: isActive ? current.color : theme.textColor }}
                                            >
                                                {current.value}
                                            </h3>
                                            <p className="uppercase tracking-[0.2em] text-[10px] font-bold mt-2 opacity-80" style={{ color: theme.textColor }}>
                                                Seguidores
                                            </p>
                                        </div>

                                        {/* Bottom: Handle */}
                                        <div
                                            className="relative z-10 mb-4 px-4 py-2 rounded-full border transition-all duration-500"
                                            style={{
                                                backgroundColor: handleBg,
                                                borderColor: cardBorder,
                                                opacity: isActive ? 1 : 0.7
                                            }}
                                        >
                                            <p className="text-sm md:text-base font-medium" style={{ color: theme.textColor }}>
                                                {handle}
                                            </p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

interface LandingPagePreviewProps {
    theme: LandingTheme;
    creatorData?: {
        name: string;
        image_url?: string;
        bio?: string;
        total_followers?: string;
        engagement_rate?: string;
        instagram_url?: string;
        youtube_url?: string;
        tiktok_url?: string;
        twitter_url?: string;
        stories_views?: string;
        gallery_urls?: string[];
        [key: string]: any;
    };
    isEditor?: boolean;
}

export function LandingPagePreview({ theme, creatorData, isEditor = false }: LandingPagePreviewProps) {
    // Safety check
    if (!theme || !theme.sections) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center text-muted-foreground">
                Carregando preview...
            </div>
        );
    }

    const orderedSections = getOrderedSections(theme);

    // Load Google Font
    React.useEffect(() => {
        if (theme.fontFamily) {
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(/ /g, '+')}:wght@300;400;500;600;700;900&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
            return () => {
                document.head.removeChild(link);
            };
        }
    }, [theme.fontFamily]);

    const [platformSettings, setPlatformSettings] = React.useState<PlatformSetting[]>([]);

    React.useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('platform_settings').select('*');
            if (data) setPlatformSettings(data);
        };
        fetchSettings();
    }, []);

    // Apply theme styles
    const themeStyles = {
        '--primary-color': theme.primaryColor || '#FF6B35',
        '--secondary-color': theme.secondaryColor || '#004E89',
        '--bg-color': theme.backgroundColor || '#FFFFFF',
        '--text-color': theme.textColor || '#1A1A1A',
        fontFamily: `"${theme.fontFamily}", sans-serif` || 'Inter, sans-serif',
    } as React.CSSProperties;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`w-full min-h-screen ${isEditor ? 'py-12' : 'pt-24 md:pt-32 pb-16'} relative overflow-x-hidden`}
            style={{
                ...themeStyles,
                backgroundColor: 'transparent', // Set background to transparent
                color: theme.textColor
            }}
        >
            <LuxuryOverlay />
            <div className="fixed inset-0 z-0">
                <ThemeBackground theme={theme} overlay={false} />
            </div>

            {orderedSections.map(({ key, config }, index) => (
                <section key={key} className="py-8 md:py-12 relative z-10" id={key}>
                    <ScrollReveal delay={index * 0.1}>
                        {renderSection(key, config, theme, creatorData, platformSettings)}
                    </ScrollReveal>
                </section>
            ))}
        </motion.div>
    );
}

function renderSection(
    key: string,
    config: any,
    theme: LandingTheme,
    creatorData?: any,
    platformSettings: PlatformSetting[] = []
) {
    switch (key) {
        case 'hero':
            const isSplit = config.heroLayout === 'split';

            if (isSplit) {
                const isMobileSplit = config.mobileLayout === 'split';

                return (
                    <div className="container mx-auto px-4">
                        <div className={`grid ${isMobileSplit ? 'grid-cols-2 gap-4' : 'grid-cols-1 gap-8'} md:grid-cols-2 md:gap-12 items-center`}>
                            {/* Image Column */}
                            <div className={`order-1 md:order-1 flex ${isMobileSplit ? 'justify-center' : 'justify-center'} md:justify-start`}>
                                {config.showAvatar && creatorData?.image_url && (
                                    <div className="relative group">
                                        <div className={`${isMobileSplit ? 'w-28 h-28' : 'w-40 h-40'} sm:w-48 sm:h-48 md:w-96 md:h-96 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-4 shadow-2xl transition-transform duration-500 hover:scale-[1.02]`} style={{ borderColor: theme.primaryColor }}>
                                            <img
                                                src={creatorData.image_url}
                                                alt={creatorData.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 w-24 h-24 md:w-48 md:h-48 rounded-full blur-[40px] md:blur-[80px] -z-10 opacity-60 animate-pulse" style={{ backgroundColor: theme.primaryColor }} />
                                        <div className="absolute -top-4 -left-4 md:-top-8 md:-left-8 w-24 h-24 md:w-48 md:h-48 rounded-full blur-[40px] md:blur-[80px] -z-10 opacity-40 animate-pulse delay-700" style={{ backgroundColor: theme.secondaryColor }} />
                                    </div>
                                )}
                            </div>

                            {/* Content Column */}
                            <div className={`order-2 md:order-2 ${isMobileSplit ? 'text-left' : 'text-center'} md:text-left`}>
                                <h1
                                    className={`${isMobileSplit ? 'text-2xl' : 'text-3xl'} sm:text-4xl md:text-7xl lg:text-8xl font-black mb-3 md:mb-6 leading-tight tracking-tight`}
                                    style={{ color: theme.primaryColor }}
                                >
                                    {config.title.replace('[Nome]', creatorData?.name || 'Creator')}
                                </h1>
                                <p className="text-base sm:text-lg md:text-xl mb-2 md:mb-4 opacity-80 font-light leading-relaxed max-w-xl mx-auto md:mx-0">
                                    {config.subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Scroll Indicator - Mobile Only */}
                        <div className="md:hidden absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
                            <ScrollIndicator accentColor={theme.primaryColor} />
                        </div>
                        {config.showScrollIndicator && (
                            <motion.div
                                className="absolute bottom-4 left-1/2 -translate-x-1/2"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                            >
                                <motion.div
                                    className="w-6 h-10 border-2 rounded-full flex justify-center p-1"
                                    style={{ borderColor: theme.textColor }}
                                >
                                    <motion.div
                                        className="w-1 h-1.5 rounded-full bg-current"
                                        style={{ backgroundColor: theme.textColor }}
                                        animate={{ y: [0, 12, 0] }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </div>
                );
            }

            // Default Centered Layout
            return (
                <div className="container mx-auto px-4 text-center">
                    {config.showAvatar && creatorData?.image_url && (
                        <motion.div
                            className="relative inline-block mb-6 md:mb-8 group"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 1.5, bounce: 0.4 }}
                        >
                            <img
                                src={creatorData.image_url}
                                alt={creatorData.name}
                                className="w-32 h-32 md:w-56 md:h-56 rounded-full object-cover border-4 shadow-xl transition-transform duration-500 group-hover:scale-105"
                                style={{ borderColor: theme.primaryColor }}
                            />
                            <div className="absolute inset-0 rounded-full blur-[40px] -z-10 opacity-50 animate-pulse" style={{ backgroundColor: theme.primaryColor }} />
                            {/* Breathing Glow */}
                            <motion.div
                                className="absolute inset-0 rounded-full blur-[20px] -z-20 opacity-30"
                                style={{ backgroundColor: theme.secondaryColor }}
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </motion.div>
                    )}

                    <ParallaxText speed={0.5}>
                        <h1
                            className="text-3xl sm:text-4xl md:text-6xl font-black mb-2 md:mb-4 tracking-tight leading-tight"
                            style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
                        >
                            {config.title.replace('[Nome]', creatorData?.name || 'Creator')}
                        </h1>
                    </ParallaxText>

                    <ParallaxText speed={0.2}>
                        <p className="text-base sm:text-lg md:text-2xl mb-2 md:mb-4 opacity-80 font-light max-w-2xl mx-auto">{config.subtitle}</p>
                    </ParallaxText>

                    {/* Scroll Indicator */}
                    {config.showScrollIndicator && (
                        <motion.div
                            className="absolute bottom-4 left-1/2 -translate-x-1/2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.5 }}
                        >
                            <motion.div
                                className="w-6 h-10 border-2 rounded-full flex justify-center p-1"
                                style={{ borderColor: theme.textColor }}
                            >
                                <motion.div
                                    className="w-1 h-1.5 rounded-full bg-current"
                                    style={{ backgroundColor: theme.textColor }}
                                    animate={{ y: [0, 12, 0] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            );

        case 'about':
            return (
                <div className="container mx-auto px-4">
                    <div className="glass rounded-2xl md:rounded-[2rem] p-6 md:p-12 max-w-4xl mx-auto backdrop-blur-md bg-white/50 dark:bg-black/20 border border-white/20">
                        <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-center" style={{ color: theme.primaryColor }}>
                            {config.title}
                        </h2>
                        <div className="prose prose-base md:prose-xl mx-auto text-center">
                            <p className="whitespace-pre-wrap leading-relaxed opacity-90">{config.content}</p>
                        </div>
                    </div>
                </div>
            );

        case 'stats':
            return (
                <div className="relative min-h-[50vh] flex items-center justify-center p-4 md:p-8 mb-4">
                    <div className="container mx-auto">
                        <div className={`flex flex-col ${config.heroLayout === 'split' ? 'md:flex-row' : ''} items-center gap-4 md:gap-12`}>
                            {/* Cycling Social Followers */}
                            <CyclingStats creatorData={creatorData} theme={theme} platformSettings={platformSettings} />

                            {[
                                { label: 'Engajamento', value: creatorData?.engagement_rate || "4.8%" },
                                { label: 'Stories Views', value: creatorData?.stories_views || "500K" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    className="w-full md:w-auto min-w-[150px] md:min-w-[200px] space-y-1 md:space-y-2 p-4 rounded-2xl glass flex flex-col justify-center items-center"
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    whileHover={{ scale: 1.05, backgroundColor: `${theme.primaryColor}10` }}
                                    transition={{ delay: (i + 1) * 0.1 }}
                                >
                                    <h3
                                        className="text-xl sm:text-3xl md:text-5xl font-bold"
                                        style={{ color: theme.textColor }}
                                    >
                                        <Counter value={stat.value} delay={(i + 1) * 0.2} />
                                    </h3>
                                    <p
                                        className="text-xs sm:text-sm md:text-base uppercase tracking-wider font-medium"
                                        style={{ color: theme.textColor, opacity: 0.7 }}
                                    >
                                        {stat.label}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Gallery Section - Only if urls exist */}
                        {creatorData?.gallery_urls && creatorData.gallery_urls.length > 0 && (
                            <div className="mb-12">
                                <h3 className={`text-2xl font-bold mb-6 text-center ${theme.textColor === '#ffffff' ? 'text-white' : 'text-gray-900'}`}>
                                    Galeria
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {creatorData.gallery_urls.map((url: string, index: number) => (
                                        <motion.div
                                            key={index}
                                            className="aspect-square rounded-xl overflow-hidden shadow-lg"
                                            initial={{ borderRadius: "50%", scale: 0.5, opacity: 0 }}
                                            whileInView={{ borderRadius: "1rem", scale: 1, opacity: 1 }}
                                            whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
                                            transition={{ type: "spring", bounce: 0.4, delay: index * 0.1 }}
                                        >
                                            <img
                                                src={url}
                                                alt={`Gallery ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'social':
            return (
                <div className="container mx-auto px-4 text-center">
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                        {[
                            { key: 'instagram', label: 'Instagram', url: creatorData?.instagram_url, active: creatorData?.instagram_active },
                            { key: 'youtube', label: 'YouTube', url: creatorData?.youtube_url, active: creatorData?.youtube_active },
                            { key: 'tiktok', label: 'TikTok', url: creatorData?.tiktok_url, active: creatorData?.tiktok_active },
                            { key: 'twitter', label: 'Twitter', url: creatorData?.twitter_url, active: creatorData?.twitter_active },
                            { key: 'kwai', label: 'Kwai', url: creatorData?.kwai_url, active: creatorData?.kwai_active },
                        ].map((platform) => {
                            // Only show if URL exists AND (active is true OR active is undefined/null - backward compatibility)
                            // In this case, we strictly follow the active flag if it exists.
                            if (!platform.url || platform.active === false) return null;

                            return (
                                <MagneticButton
                                    key={platform.key}
                                    href={platform.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`
                                        px-6 py-3 md:px-8 md:py-4 rounded-full transition-all flex items-center gap-2 md:gap-3 font-semibold text-sm md:text-lg
                                        hover:scale-105 active:scale-95
                                        ${config.buttonStyle === 'outline' ? 'border-2' : ''}
                                        ${config.buttonStyle === 'minimal' ? 'hover:bg-muted glass' : 'shadow-lg'}
                                    `}
                                    style={config.buttonStyle === 'filled' ? {
                                        backgroundColor: theme.primaryColor,
                                        color: '#fff',
                                        boxShadow: `0 10px 20px -5px ${theme.primaryColor}40`
                                    } : {
                                        borderColor: theme.primaryColor,
                                        color: theme.primaryColor
                                    }}
                                >
                                    <span className="capitalize">{platform.label}</span>
                                </MagneticButton>
                            );
                        })}
                    </div>
                </div>
            );

        case 'contact':
            if (!config.showForm) return null;
            return (
                <div className="container mx-auto px-4">
                    <div className="max-w-xl mx-auto glass p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-2xl border border-white/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: theme.primaryColor }} />
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">{config.formTitle}</h2>
                        <form className="space-y-4 md:space-y-6">
                            <div>
                                <label className="text-xs md:text-sm font-bold mb-2 block opacity-70 uppercase tracking-wider">Nome</label>
                                <input type="text" className="w-full p-3 md:p-4 rounded-xl border bg-background/50 focus:ring-2 transition-all outline-none text-sm md:text-base" style={{ borderColor: 'transparent', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)' }} />
                            </div>
                            <div>
                                <label className="text-xs md:text-sm font-bold mb-2 block opacity-70 uppercase tracking-wider">Email</label>
                                <input type="email" className="w-full p-3 md:p-4 rounded-xl border bg-background/50 focus:ring-2 transition-all outline-none text-sm md:text-base" style={{ borderColor: 'transparent', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)' }} />
                            </div>
                            <div>
                                <label className="text-xs md:text-sm font-bold mb-2 block opacity-70 uppercase tracking-wider">Mensagem</label>
                                <textarea className="w-full p-3 md:p-4 rounded-xl border bg-background/50 focus:ring-2 transition-all outline-none text-sm md:text-base" rows={4} style={{ borderColor: 'transparent', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)' }} />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                                style={{ backgroundColor: theme.primaryColor, color: '#fff' }}
                            >
                                {config.submitText}
                            </button>
                        </form>
                    </div>
                </div>
            );

        case 'cta':
            return (
                <div className="container mx-auto px-4 text-center">
                    <motion.a
                        href={config.link}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                            inline-block px-8 py-4 md:px-12 md:py-5 rounded-full font-bold text-lg md:text-xl shadow-xl
                            ${config.style === 'outline' ? 'border-2' : ''}
                            ${config.style === 'minimal' ? 'hover:bg-muted glass' : ''}
                        `}
                        style={config.style === 'filled' ? {
                            backgroundColor: theme.primaryColor,
                            color: '#fff',
                            boxShadow: `0 10px 30px -10px ${theme.primaryColor}80`
                        } : {
                            borderColor: theme.primaryColor,
                            color: theme.primaryColor
                        }}
                    >
                        {config.text}
                    </motion.a>
                </div>
            );



        default:
            return null;
    }
}
