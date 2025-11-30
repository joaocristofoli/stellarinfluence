import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface BoldBackgroundProps {
    primaryColor?: string;
    secondaryColor?: string;
}

export const BoldBackground = ({ primaryColor = "#FF6B35", secondaryColor = "#004E89" }: BoldBackgroundProps) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 180]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

    return (
        <div ref={ref} className="absolute inset-0 overflow-hidden">
            {/* Animated Gradient Background */}
            <motion.div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}40)`,
                    scale
                }}
            />

            {/* Sharp Angular Shapes */}
            <motion.div
                className="absolute w-[800px] h-[800px] -top-40 -right-20"
                style={{
                    y: y1,
                    rotate,
                    background: `linear-gradient(45deg, ${primaryColor}30, transparent)`,
                    clipPath: "polygon(0 0, 100% 0, 100% 70%, 30% 100%, 0 60%)"
                }}
            />

            <motion.div
                className="absolute w-[600px] h-[600px] bottom-0 left-0"
                style={{
                    y: y2,
                    background: `linear-gradient(225deg, ${secondaryColor}25, transparent)`,
                    clipPath: "polygon(0 30%, 70% 0, 100% 100%, 0 100%)"
                }}
            />

            {/* Glitch Lines */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute h-[2px] bg-white/10"
                    style={{
                        top: `${5 + i * 6}%`,
                        left: 0,
                        right: 0,
                        width: `${60 + (i % 3) * 20}%`,
                        x: `${i % 2 === 0 ? -100 : 100}%`
                    }}
                    animate={{
                        x: ["0%", `${i % 2 === 0 ? 100 : -100}%`],
                        opacity: [0, 0.3, 0]
                    }}
                    transition={{
                        duration: 4 + (i % 3),
                        repeat: Infinity,
                        delay: i * 0.2
                    }}
                />
            ))}

            {/* Fast Moving Particles */}
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                        background: i % 2 === 0 ? primaryColor : secondaryColor,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        x: [0, (Math.random() - 0.5) * 1000],
                        y: [0, (Math.random() - 0.5) * 1000],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0]
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                    }}
                />
            ))}

            {/* Bold Radial Gradient */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] opacity-30"
                style={{
                    background: `radial-gradient(circle, ${primaryColor}40 0%, transparent 70%)`
                }}
            />
        </div>
    );
};
