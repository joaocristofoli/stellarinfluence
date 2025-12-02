import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { LandingTheme } from "@/types/landingTheme";

interface MagneticBackgroundProps {
    theme: LandingTheme;
    position?: 'fixed' | 'absolute';
}

export function MagneticBackground({ theme, position = 'fixed' }: MagneticBackgroundProps) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring physics for the cursor follower
    const springConfig = { damping: 25, stiffness: 120 };
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

    // Grid distortion effect
    const gridSize = 50; // px
    const cols = Math.ceil(dimensions.width / gridSize);
    const rows = Math.ceil(dimensions.height / gridSize);

    return (
        <div className={`${position} inset-0 overflow-hidden z-[-1]`} style={{ backgroundColor: theme.backgroundColor }}>
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-900/20 to-transparent" />

            {/* Magnetic Cursor Follower */}
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${theme.primaryColor}, transparent 70%)`,
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            />

            {/* Secondary Follower (Lagging) */}
            <motion.div
                className="absolute w-[300px] h-[300px] rounded-full opacity-15 blur-[80px] pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${theme.secondaryColor}, transparent 70%)`,
                    x: useSpring(mouseX, { damping: 40, stiffness: 80 }),
                    y: useSpring(mouseY, { damping: 40, stiffness: 80 }),
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            />

            {/* Interactive Grid Points */}
            <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(${theme.textColor}33 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                opacity: 0.1
            }} />

            {/* Floating Elements */}
            {[...Array(5)].map((_, i) => (
                <FloatingElement key={i} index={i} theme={theme} />
            ))}
        </div>
    );
}

function FloatingElement({ index, theme }: { index: number, theme: LandingTheme }) {
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;
    const size = 100 + Math.random() * 200;

    return (
        <motion.div
            className="absolute rounded-full blur-3xl opacity-10"
            style={{
                width: size,
                height: size,
                background: index % 2 === 0 ? theme.primaryColor : theme.secondaryColor,
                left: `${randomX}%`,
                top: `${randomY}%`,
            }}
            animate={{
                x: [0, 50, -50, 0],
                y: [0, -50, 50, 0],
                scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
            }}
        />
    );
}
