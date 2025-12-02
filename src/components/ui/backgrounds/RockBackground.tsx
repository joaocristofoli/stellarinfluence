import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { LandingTheme } from "@/types/landingTheme";

interface RockBackgroundProps {
    theme: LandingTheme;
    position?: 'fixed' | 'absolute';
}

export const RockBackground = ({ theme, position = 'fixed' }: RockBackgroundProps) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const primaryColor = theme.primaryColor || "#FF4500";
    const secondaryColor = theme.secondaryColor || "#8B0000";

    return (
        <div ref={ref} className={`${position} inset-0 overflow-hidden bg-black z-[-1]`}>
            {/* Heat Distortion Filter */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <filter id="heat">
                    <feTurbulence type="fractalNoise" baseFrequency="0.01 0.02" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
                </filter>
            </svg>

            {/* Base Dark Layer */}
            <div className="absolute inset-0 bg-neutral-950" />

            {/* Magma Gradient Bottom */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-[60vh] opacity-60"
                style={{
                    background: `linear-gradient(to top, ${secondaryColor}, ${primaryColor}40, transparent)`,
                    filter: 'url(#heat)',
                }}
                animate={{
                    opacity: [0.5, 0.7, 0.5],
                    scaleY: [1, 1.1, 1]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Rising Embers */}
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={`ember-${i}`}
                    className="absolute rounded-full mix-blend-screen"
                    style={{
                        width: Math.random() * 4 + 2,
                        height: Math.random() * 4 + 2,
                        background: i % 2 === 0 ? '#FFD700' : primaryColor,
                        left: `${Math.random() * 100}%`,
                        bottom: '-10%',
                        boxShadow: `0 0 10px ${primaryColor}`
                    }}
                    animate={{
                        y: [-100, -window.innerHeight * 1.2],
                        x: [0, (Math.random() - 0.5) * 200],
                        opacity: [0, 1, 0],
                        scale: [1, 0]
                    }}
                    transition={{
                        duration: 5 + Math.random() * 5,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "easeOut"
                    }}
                />
            ))}

            {/* Smoke Layers */}
            <motion.div
                className="absolute inset-0 opacity-30 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: 'cover'
                }}
                animate={{
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Vignette */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-90"
                style={{ background: 'radial-gradient(circle, transparent 20%, black 100%)' }}
            />
        </div>
    );
};
