import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { LandingTheme } from "@/types/landingTheme";

interface LifestyleBackgroundProps {
    theme: LandingTheme;
    position?: 'fixed' | 'absolute';
}

export const LifestyleBackground = ({ theme, position = 'fixed' }: LifestyleBackgroundProps) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 50 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    const primaryColor = theme.primaryColor || "#FF9B9B";
    const secondaryColor = theme.secondaryColor || "#A8D8EA";
    const backgroundColor = theme.backgroundColor || "#FFF5F5";

    return (
        <div className={`${position} inset-0 overflow-hidden z-[-1] bg-white`}>
            {/* Base Background */}
            <div className="absolute inset-0" style={{ background: backgroundColor }} />

            {/* Watercolor Blur Filter */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <filter id="watercolor">
                    <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" />
                    <feGaussianBlur stdDeviation="20" />
                </filter>
            </svg>

            {/* Animated Watercolor Blobs */}
            <div className="absolute inset-0 opacity-60 mix-blend-multiply filter url(#watercolor)">
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full"
                    style={{
                        background: primaryColor,
                        top: '10%',
                        left: '10%',
                        x: springX,
                        y: springY,
                    }}
                    animate={{
                        scale: [1, 1.2, 0.9, 1],
                        rotate: [0, 90, 180, 270, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full"
                    style={{
                        background: secondaryColor,
                        bottom: '10%',
                        right: '10%',
                        x: useTransform(springX, (val) => -val * 0.5),
                        y: useTransform(springY, (val) => -val * 0.5),
                    }}
                    animate={{
                        scale: [1, 1.3, 0.8, 1],
                        rotate: [360, 270, 180, 90, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <motion.div
                    className="absolute w-[400px] h-[400px] rounded-full bg-yellow-200"
                    style={{
                        top: '40%',
                        left: '40%',
                        opacity: 0.5
                    }}
                    animate={{
                        scale: [1, 1.5, 1],
                        x: [0, 100, -100, 0],
                        y: [0, -100, 100, 0],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
};
