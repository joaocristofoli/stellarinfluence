import { useEffect, useState } from "react";

export const LuxuryOverlay = () => {
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        // Fade in effect
        const timer = setTimeout(() => setOpacity(1), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" style={{ opacity, transition: "opacity 1s ease-in-out" }}>
            {/* Noise Texture */}
            <div
                className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                }}
            />

            {/* Vignette - Reduced opacity for brighter feel */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%)"
                }}
            />

            {/* Top Gold Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

            {/* Bottom Gold Accent Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
        </div>
    );
};
