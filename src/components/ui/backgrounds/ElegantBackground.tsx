import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { LandingTheme } from "@/types/landingTheme";

interface ElegantBackgroundProps {
    theme: LandingTheme;
    position?: 'fixed' | 'absolute';
}

export const ElegantBackground = ({ theme, position = 'fixed' }: ElegantBackgroundProps) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 30, stiffness: 200 };
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

    const primaryColor = theme.primaryColor || "#C9A961";
    const backgroundColor = theme.backgroundColor || "#F5F5F0";

    return (
        <div className={`${position} inset-0 overflow-hidden z-[-1]`} style={{ background: backgroundColor }}>
            {/* Silk Waves using SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
                <motion.path
                    d="M0,50 C150,150 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z"
                    fill={`url(#gradient1)`}
                    style={{
                        scaleY: useTransform(springY, [0, 1000], [0.8, 1.2]),
                        y: useTransform(springY, [0, 1000], [-20, 20])
                    }}
                />
                <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={primaryColor} stopOpacity="0" />
                        <stop offset="50%" stopColor={primaryColor} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Floating Gold Dust */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: Math.random() * 4 + 1,
                        height: Math.random() * 4 + 1,
                        background: primaryColor,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        boxShadow: `0 0 10px ${primaryColor}`
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 0.8, 0],
                        scale: [0, 1, 0]
                    }}
                    transition={{
                        duration: 10 + Math.random() * 10,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Radial Sheen following mouse */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full opacity-10 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${primaryColor}, transparent 70%)`,
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            />

            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
            />
        </div>
    );
};
