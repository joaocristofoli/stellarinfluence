import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { LandingTheme } from "@/types/landingTheme";

interface MinimalBackgroundProps {
    theme: LandingTheme;
    position?: 'fixed' | 'absolute';
}

export const MinimalBackground = ({ theme, position = 'fixed' }: MinimalBackgroundProps) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 50, stiffness: 100 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [mouseX, mouseY]);

    const primaryColor = theme.primaryColor || "#000000";
    const backgroundColor = theme.backgroundColor || "#FFFFFF";

    return (
        <div className={`${position} inset-0 overflow-hidden z-[-1] bg-white`}>
            {/* Base Background */}
            <div
                className="absolute inset-0"
                style={{ background: backgroundColor }}
            />

            {/* Breathing Gradient Mesh */}
            <motion.div
                className="absolute inset-0 opacity-40"
                style={{
                    background: `
                        radial-gradient(circle at 50% 50%, ${primaryColor}10 0%, transparent 50%),
                        radial-gradient(circle at 0% 0%, ${theme.secondaryColor}10 0%, transparent 50%),
                        radial-gradient(circle at 100% 100%, ${primaryColor}10 0%, transparent 50%)
                    `,
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Interactive Mouse Follower Gradient */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${primaryColor}, transparent 70%)`,
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            />

            {/* Noise Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Floating Particles */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-32 h-32 rounded-full blur-3xl opacity-10"
                    style={{
                        background: i % 2 === 0 ? primaryColor : theme.secondaryColor,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 15 + Math.random() * 10,
                        repeat: Infinity,
                        delay: i * 2,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};
