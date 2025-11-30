import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { LandingTheme } from "@/types/landingTheme";

interface MinimalBackgroundProps {
    theme: LandingTheme;
    position?: 'fixed' | 'absolute';
}

export const MinimalBackground = ({ theme, position = 'fixed' }: MinimalBackgroundProps) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const x = useTransform(scrollYProgress, [0, 1], [0, 100]);

    const primaryColor = theme.primaryColor || "#FFD700";
    const backgroundColor = theme.backgroundColor || "#FFFFFF";

    return (
        <div ref={ref} className={`${position} inset-0 overflow-hidden z-[-1]`}>
            {/* Clean Background */}
            <div
                className="absolute inset-0"
                style={{ background: backgroundColor }}
            />

            {/* Slow Moving Gradient Blob */}
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
                style={{
                    background: `radial - gradient(circle, ${primaryColor}, transparent)`,
                    top: '10%',
                    left: '-10%',
                    y,
                    x
                }}
                animate={{
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
                style={{
                    background: `radial - gradient(circle, ${primaryColor}80, transparent)`,
                    bottom: '5%',
                    right: '-5%',
                    y: useTransform(scrollYProgress, [0, 1], [0, 150])
                }}
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Minimal Floating Dots */}
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        background: primaryColor,
                        opacity: 0.15,
                        left: `${10 + i * 7}% `,
                        top: `${20 + (i % 5) * 15}% `,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.1, 0.25, 0.1]
                    }}
                    transition={{
                        duration: 8 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Clean Lines */}
            <motion.div
                className="absolute h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-10"
                style={{
                    width: '100%',
                    top: '30%',
                    color: primaryColor
                }}
                animate={{
                    scaleX: [0.8, 1, 0.8],
                    opacity: [0.05, 0.15, 0.05]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
};
