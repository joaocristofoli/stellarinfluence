import { HomepageConfig } from '@/types/homepageConfig';
import { ParticleBackground } from '../ParticleBackground';

interface HeroPreviewProps {
    config: HomepageConfig;
    isMobile: boolean;
}

/**
 * HeroPreview - Live preview of the homepage hero section
 * 
 * @description
 * Renders a live preview that updates in real-time as the
 * user modifies homepage configuration. Supports both
 * desktop and mobile preview modes.
 */
export function HeroPreview({ config, isMobile }: HeroPreviewProps) {
    return (
        <div
            className={`relative rounded-lg overflow-hidden border bg-black transition-all duration-300 ${isMobile ? 'w-[375px] h-[500px]' : 'w-full h-[500px]'
                }`}
            style={{
                boxShadow: isMobile ? '0 20px 50px -10px rgba(0,0,0,0.3)' : 'none'
            }}
        >
            {/* Particles Animation */}
            {config.enable_particle_animation && config.background_type === 'particles' && (
                <ParticleBackground
                    count={config.particle_count}
                    size={config.particle_size}
                    speed={config.particle_speed}
                    opacity={config.particle_opacity}
                    color={config.particle_color}
                />
            )}

            {/* Background gradient */}
            {config.background_type === 'gradient' && config.enable_gradient_animation && (
                <div
                    className="absolute inset-0 opacity-30 animate-pulse"
                    style={{
                        background: `radial-gradient(circle at 30% 20%, ${config.primary_color}40, transparent 50%), radial-gradient(circle at 70% 80%, ${config.secondary_color}40, transparent 50%)`,
                        animation: `pulse ${config.gradient_speed}s ease-in-out infinite`
                    }}
                />
            )}

            {/* Default gradient background (always visible but subtle) */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    background: `radial-gradient(circle at 30% 20%, ${config.primary_color}30, transparent 50%), radial-gradient(circle at 70% 80%, ${config.secondary_color}30, transparent 50%)`
                }}
            />

            {/* Simulated Hero Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
                {/* Badge */}
                <div className="mb-4">
                    <span
                        className="inline-block px-4 py-1.5 rounded-full text-xs font-medium"
                        style={{
                            background: `linear-gradient(90deg, ${config.primary_color}20, ${config.secondary_color}20)`,
                            border: `1px solid ${config.primary_color}40`,
                            color: config.primary_color
                        }}
                    >
                        {config.hero_badge_text}
                    </span>
                </div>

                {/* Title */}
                <h1 className={`font-bold text-white mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
                    <div>{config.hero_title_line1}</div>
                    <div
                        className="bg-clip-text text-transparent"
                        style={{
                            backgroundImage: `linear-gradient(90deg, ${config.primary_color}, ${config.accent_color}, ${config.secondary_color})`
                        }}
                    >
                        {config.hero_title_line2}
                    </div>
                    <div>{config.hero_title_line3}</div>
                </h1>

                {/* Subtitle */}
                <p className={`text-white/70 mb-6 max-w-2xl ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {config.hero_subtitle}
                </p>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                    <button
                        className="px-6 py-2.5 rounded-lg text-white font-medium text-sm"
                        style={{
                            background: `linear-gradient(135deg, ${config.primary_color}, ${config.secondary_color})`
                        }}
                    >
                        {config.cta_primary_text}
                    </button>
                    <button
                        className="px-6 py-2.5 rounded-lg text-white font-medium border text-sm"
                        style={{ borderColor: config.primary_color + '40' }}
                    >
                        {config.cta_secondary_text}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HeroPreview;
