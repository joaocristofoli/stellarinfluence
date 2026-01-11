import * as React from "react";
import { LandingTheme, getOrderedSections } from "@/types/landingTheme";
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, AnimatePresence } from "framer-motion";
import { formatNumber } from "@/utils/formatters";

// --- Helper Components ---

import { ThemeBackground } from "@/components/ui/ThemeBackground";
import { ScrollIndicator } from "@/components/landing/ScrollIndicator";
import { LuxuryOverlay } from "@/components/ui/LuxuryOverlay";
import { TouchRippleEffect } from "@/components/landing/TouchRippleEffect";
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
    // Base platforms list
    const platforms = [
        { key: 'instagram', label: 'Instagram', color: '#E1306C', value: creatorData?.instagram_followers, icon: Instagram, url: creatorData?.instagram_url, secondaryValue: creatorData?.stories_views, secondaryLabel: 'Stories' },
        { key: 'youtube', label: 'YouTube', color: '#FF0000', value: creatorData?.youtube_subscribers, icon: Youtube, url: creatorData?.youtube_url },
        { key: 'tiktok', label: 'TikTok', color: '#00F2EA', value: creatorData?.tiktok_followers, icon: Video, url: creatorData?.tiktok_url },
        { key: 'twitter', label: 'Twitter', color: '#1DA1F2', value: creatorData?.twitter_followers, icon: Twitter, url: creatorData?.twitter_url },
        { key: 'kwai', label: 'Kwai', color: '#FF8F00', value: creatorData?.kwai_followers, icon: Video, url: creatorData?.kwai_url },
    ].filter(p => {
        const isActive = creatorData?.[`${p.key}_active`];
        return p.value && isActive !== false;
    }).sort((a, b) => {
        if (creatorData?.primary_platform === a.key) return -1;
        if (creatorData?.primary_platform === b.key) return 1;
        return 0;
    });

    const isSingle = platforms.length === 1;
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: platforms.length > 1,
        align: 'center',
        skipSnaps: false,
        dragFree: false,
        containScroll: 'trimSnaps'
    });

    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

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

    // Theme detection
    const isDarkTheme = theme.textColor === '#ffffff' || theme.textColor === '#fff' || theme.textColor.toLowerCase() === '#f8fafc';

    return (
        <div className="w-full relative py-16 overflow-visible">
            <div className={`overflow-visible ${isSingle ? 'flex justify-center' : ''}`} ref={isSingle ? undefined : emblaRef}>
                <div className={`flex touch-pan-y gap-8 ${isSingle ? 'justify-center w-full' : ''}`}>
                    {platforms.map((current, index) => {
                        const isActive = isSingle ? true : selectedIndex === index;
                        const isHovered = hoveredIndex === index;
                        const isPrimary = creatorData?.primary_platform === current.key;
                        const setting = platformSettings.find(s => s.platform === current.key);
                        const isInstagram = current.key === 'instagram';

                        // Styles
                        const isTransparent = setting?.is_transparent;
                        const useThemeColor = setting?.use_theme_color ?? true;
                        const bubbleBg = isTransparent ? 'transparent' :
                            useThemeColor ? theme.textColor : (setting?.bg_color || 'transparent');
                        const iconColor = isTransparent ? current.color :
                            useThemeColor ? theme.backgroundColor : '#ffffff';

                        // Handle extraction
                        let handle = '@perfil';
                        if (current.url) {
                            try {
                                let cleanUrl = current.url.replace(/(^\w+:|^)\/\//, '');
                                if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
                                const parts = cleanUrl.split('/');
                                const lastPart = parts[parts.length - 1];
                                if (lastPart) handle = '@' + lastPart.replace(/^@/, '');
                            } catch (e) { handle = '@perfil'; }
                        }

                        // Dynamic colors for theme
                        const cardBorder = isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
                        const cardBorderActive = isDarkTheme ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)';
                        const glassOverlay = isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)';
                        const innerGlass = isDarkTheme ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';

                        // Dimensions
                        const cardDimensions = isInstagram
                            ? "w-[300px] h-[380px] md:w-[360px] md:h-[440px]"
                            : "w-[280px] h-[320px] md:w-[320px] md:h-[360px]";

                        return (
                            <motion.div
                                className="flex-[0_0_auto] min-w-0"
                                key={current.key}
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: index * 0.1
                                }}
                            >
                                <div className={`${cardDimensions} flex items-center justify-center`}>
                                    <motion.a
                                        href={current.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative w-full h-full flex flex-col items-center justify-between p-7 rounded-[2rem] cursor-pointer overflow-hidden group"
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        animate={{
                                            scale: isActive ? 1 : 0.92,
                                            opacity: isActive ? 1 : 0.6,
                                            filter: isActive ? 'grayscale(0%) blur(0px)' : 'grayscale(50%) blur(0.5px)',
                                            rotateY: isHovered && isActive ? 2 : 0,
                                            rotateX: isHovered && isActive ? -2 : 0,
                                        }}
                                        whileHover={isActive ? {
                                            scale: 1.02,
                                            transition: { type: "spring", stiffness: 400, damping: 25 }
                                        } : {}}
                                        transition={{
                                            duration: 0.4,
                                            ease: [0.25, 0.1, 0.25, 1]
                                        }}
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            perspective: '1000px',
                                            zIndex: isActive ? 30 : isHovered ? 20 : 10,
                                        }}
                                    >
                                        {/* Multi-layer Glass Background */}
                                        <div
                                            className="absolute inset-0 rounded-[2rem] overflow-hidden"
                                            style={{
                                                background: `linear-gradient(135deg, ${glassOverlay} 0%, ${innerGlass} 100%)`,
                                                backdropFilter: 'blur(30px) saturate(150%)',
                                                WebkitBackdropFilter: 'blur(30px) saturate(150%)',
                                            }}
                                        >
                                            {/* Gradient Border */}
                                            <div
                                                className="absolute inset-0 rounded-[2rem]"
                                                style={{
                                                    padding: '1px',
                                                    background: isActive
                                                        ? `linear-gradient(135deg, ${current.color}, ${current.color}80, ${current.color})`
                                                        : `linear-gradient(135deg, ${cardBorder}, ${cardBorderActive})`,
                                                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                                    maskComposite: 'exclude',
                                                    WebkitMaskComposite: 'xor',
                                                }}
                                            />
                                        </div>

                                        {/* Ambient Glow */}
                                        {isActive && (
                                            <motion.div
                                                className="absolute inset-0 rounded-[2rem] pointer-events-none"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: isHovered ? 0.3 : 0.2 }}
                                                transition={{ duration: 0.3 }}
                                                style={{
                                                    background: `radial-gradient(circle at 50% 50%, ${current.color}40, transparent 70%)`,
                                                    filter: 'blur(20px)',
                                                }}
                                            />
                                        )}

                                        {/* Luxury Shadow Layers */}
                                        <div
                                            className="absolute inset-0 rounded-[2rem] pointer-events-none"
                                            style={{
                                                boxShadow: isActive
                                                    ? `0 8px 32px -8px ${current.color}30, 0 20px 60px -10px ${current.color}20, inset 0 1px 2px ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}`
                                                    : `0 4px 12px -4px rgba(0,0,0,0.1), inset 0 1px 1px ${isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)'}`,
                                            }}
                                        />

                                        {/* Crown for Primary */}
                                        {isPrimary && (
                                            <motion.div
                                                className="absolute -top-2 -right-2 z-40"
                                                animate={{
                                                    rotate: [0, -5, 5, -5, 0],
                                                    scale: isHovered ? 1.1 : 1,
                                                }}
                                                transition={{
                                                    rotate: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                                                    scale: { duration: 0.2 }
                                                }}
                                            >
                                                <div className="relative bg-gradient-to-br from-yellow-300 to-yellow-600 p-2.5 rounded-2xl shadow-xl border border-yellow-200/50">
                                                    <div className="absolute inset-0 bg-yellow-500 blur-lg opacity-50 rounded-2xl" />
                                                    <Crown className="w-5 h-5 text-white fill-white relative z-10" />
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Platform Icon */}
                                        <motion.div
                                            className="relative z-20 mb-6"
                                            animate={{
                                                y: isActive && isHovered ? [-2, 2, -2] : 0,
                                                scale: isActive ? 1 : 0.9,
                                            }}
                                            transition={{
                                                y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                                                scale: { duration: 0.3 }
                                            }}
                                        >
                                            <div
                                                className="rounded-full flex items-center justify-center transition-all duration-500 relative"
                                                style={{
                                                    width: isActive ? '84px' : '68px',
                                                    height: isActive ? '84px' : '68px',
                                                    backgroundColor: bubbleBg,
                                                    boxShadow: isActive
                                                        ? `0 8px 24px -4px ${current.color}40, inset 0 2px 4px rgba(255,255,255,0.2)`
                                                        : `0 4px 12px -2px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.1)`,
                                                }}
                                            >
                                                {/* Icon Glow */}
                                                {isActive && (
                                                    <div
                                                        className="absolute inset-0 rounded-full blur-md opacity-40"
                                                        style={{ backgroundColor: current.color }}
                                                    />
                                                )}
                                                {setting?.icon_url ? (
                                                    <img
                                                        src={setting.icon_url}
                                                        alt={current.label}
                                                        className="object-contain relative z-10"
                                                        style={{
                                                            width: isActive ? '44px' : '36px',
                                                            height: isActive ? '44px' : '36px',
                                                        }}
                                                    />
                                                ) : (
                                                    <current.icon
                                                        className="relative z-10"
                                                        style={{
                                                            color: iconColor,
                                                            width: isActive ? '44px' : '36px',
                                                            height: isActive ? '44px' : '36px',
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Stats Container */}
                                        <div className="relative z-20 flex flex-col items-center justify-center flex-1 w-full">
                                            {isInstagram ? (
                                                // Instagram: Followers + Stories
                                                <div className={`grid grid-cols-2 gap-4 w-full items-center text-center relative`}>
                                                    {/* Elegant Divider */}
                                                    <div
                                                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-16 rounded-full"
                                                        style={{
                                                            background: `linear-gradient(to bottom, transparent, ${isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}, transparent)`,
                                                        }}
                                                    />

                                                    <div className="flex flex-col items-center gap-1 px-2">
                                                        <motion.h3
                                                            className="font-black tracking-tighter"
                                                            style={{
                                                                color: isActive ? current.color : theme.textColor,
                                                                fontSize: isActive ? '2rem' : '1.75rem',
                                                                textShadow: isActive ? `0 2px 8px ${current.color}30` : 'none',
                                                            }}
                                                            animate={{ scale: isActive && isHovered ? 1.05 : 1 }}
                                                        >
                                                            {formatNumber(current.value)}
                                                        </motion.h3>
                                                        <p
                                                            className="uppercase tracking-widest text-[9px] font-bold opacity-70"
                                                            style={{ color: theme.textColor, letterSpacing: '0.15em' }}
                                                        >
                                                            Seguidores
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col items-center gap-1 px-2">
                                                        <motion.h3
                                                            className="font-black tracking-tighter"
                                                            style={{
                                                                color: theme.textColor,
                                                                fontSize: isActive ? '2rem' : '1.75rem',
                                                            }}
                                                            animate={{ scale: isActive && isHovered ? 1.05 : 1 }}
                                                        >
                                                            {formatNumber(current.secondaryValue)}
                                                        </motion.h3>
                                                        <p
                                                            className="uppercase tracking-widest text-[9px] font-bold opacity-70"
                                                            style={{ color: theme.textColor, letterSpacing: '0.15em' }}
                                                        >
                                                            Stories
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Other Platforms: Single Stat
                                                <div className="flex flex-col items-center gap-2">
                                                    <motion.h3
                                                        className="font-black tracking-tighter leading-none"
                                                        style={{
                                                            color: isActive ? current.color : theme.textColor,
                                                            fontSize: isActive ? '3.5rem' : '3rem',
                                                            textShadow: isActive ? `0 4px 16px ${current.color}30` : 'none',
                                                        }}
                                                        animate={{ scale: isActive && isHovered ? 1.08 : 1 }}
                                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                    >
                                                        {formatNumber(current.value)}
                                                    </motion.h3>
                                                    <p
                                                        className="uppercase tracking-widest text-[10px] font-bold opacity-70"
                                                        style={{ color: theme.textColor, letterSpacing: '0.2em' }}
                                                    >
                                                        {current.key === 'youtube' ? 'Inscritos' : 'Seguidores'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Handle Badge */}
                                        <motion.div
                                            className="relative z-20 mt-6 px-7 py-2.5 rounded-full overflow-hidden"
                                            animate={{
                                                opacity: isActive ? 1 : 0.7,
                                                scale: isActive && isHovered ? 1.05 : 1,
                                            }}
                                            transition={{ duration: 0.2 }}
                                            style={{
                                                background: isDarkTheme
                                                    ? 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
                                                    : 'linear-gradient(135deg, rgba(0,0,0,0.08), rgba(0,0,0,0.04))',
                                                backdropFilter: 'blur(10px)',
                                                border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                                                boxShadow: `0 2px 8px -2px ${isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'}`,
                                            }}
                                        >
                                            <p
                                                className="text-sm font-semibold tracking-wide"
                                                style={{ color: theme.textColor }}
                                            >
                                                {handle}
                                            </p>
                                        </motion.div>
                                    </motion.a>
                                </div>
                            </motion.div>
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
            <TouchRippleEffect />
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

                        {/* Scroll Indicator - Mobile Only - At the very bottom */}
                        <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
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
