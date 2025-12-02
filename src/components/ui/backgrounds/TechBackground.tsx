import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { LandingTheme } from "@/types/landingTheme";

interface TechBackgroundProps {
    theme: LandingTheme;
    overlay?: boolean;
    position?: 'fixed' | 'absolute';
}

export const TechBackground = ({ theme, overlay = false, position = 'fixed' }: TechBackgroundProps) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 100 };
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
            // Normalize mouse position -1 to 1
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [mouseX, mouseY]);

    const primaryColor = theme.primaryColor || "#00FF88";
    const secondaryColor = theme.secondaryColor || "#FF0044";
    const backgroundColor = theme.backgroundColor || "#0D0D0D";

    // 3D Tilt Effect
    const rotateX = useTransform(springY, [-1, 1], [10, -10]);
    const rotateY = useTransform(springX, [-1, 1], [-10, 10]);

    return (
        <div className={`${position} inset-0 overflow-hidden bg-black z-[-1] perspective-1000`}>
            {/* Base Background */}
            <div className="absolute inset-0" style={{ background: backgroundColor }} />

            {/* 3D Grid Plane */}
            <motion.div
                className="absolute inset-[-50%]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, ${primaryColor}30 1px, transparent 1px),
                        linear-gradient(to bottom, ${primaryColor}30 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                    rotateX: 60,
                    rotateY,
                    rotateZ: rotateX,
                    scale: 1.5,
                }}
            />

            {/* Digital Rain / Matrix Effect */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-[2px] bg-gradient-to-b from-transparent via-current to-transparent opacity-50"
                    style={{
                        height: Math.random() * 200 + 100,
                        left: `${Math.random() * 100}%`,
                        color: i % 3 === 0 ? secondaryColor : primaryColor,
                        boxShadow: `0 0 10px ${i % 3 === 0 ? secondaryColor : primaryColor}`
                    }}
                    animate={{
                        y: [-200, window.innerHeight + 200],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Floating Cyber Hexagons */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={`hex-${i}`}
                    className="absolute opacity-20 border-2"
                    style={{
                        width: 100 + i * 50,
                        height: 100 + i * 50,
                        borderColor: primaryColor,
                        left: '50%',
                        top: '50%',
                        x: '-50%',
                        y: '-50%',
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                    }}
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: 10 + i * 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    background: `linear-gradient(to bottom, transparent 50%, black 50%)`,
                    backgroundSize: '100% 4px'
                }}
            />

            {/* Vignette */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-80"
                style={{ background: 'radial-gradient(circle, transparent 40%, black 100%)' }}
            />
        </div>
    );
};
