import { motion } from "framer-motion";
import { LandingTheme } from "@/types/landingTheme";

interface LiquidBackgroundProps {
    theme: LandingTheme;
    position?: 'fixed' | 'absolute';
}

export function LiquidBackground({ theme, position = 'fixed' }: LiquidBackgroundProps) {
    return (
        <div className={`${position} inset-0 overflow-hidden z-[-1]`} style={{ backgroundColor: theme.backgroundColor }}>
            {/* SVG Filter for Metaball effect */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <filter id="goo">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                    <feBlend in="SourceGraphic" in2="goo" />
                </filter>
            </svg>

            {/* Background Gradient */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `linear-gradient(to bottom right, ${theme.backgroundColor}, ${theme.secondaryColor}20)`
                }}
            />

            {/* Animated Blobs Container with Filter */}
            <div className="absolute inset-0 filter url(#goo) opacity-80">
                <motion.div
                    className="absolute top-[20%] left-[20%] w-96 h-96 rounded-full mix-blend-multiply filter blur-xl"
                    style={{ backgroundColor: theme.primaryColor }}
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -50, 100, 0],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-[40%] right-[20%] w-96 h-96 rounded-full mix-blend-multiply filter blur-xl"
                    style={{ backgroundColor: theme.secondaryColor }}
                    animate={{
                        x: [0, -100, 50, 0],
                        y: [0, 100, -50, 0],
                        scale: [1, 1.3, 0.8, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-[20%] left-[40%] w-80 h-80 rounded-full mix-blend-multiply filter blur-xl"
                    style={{ backgroundColor: theme.primaryColor }}
                    animate={{
                        x: [0, 50, -100, 0],
                        y: [0, -100, 50, 0],
                        scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 22,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Glass Overlay Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}
