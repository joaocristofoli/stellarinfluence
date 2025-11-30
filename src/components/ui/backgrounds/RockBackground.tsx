import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface RockBackgroundProps {
    primaryColor?: string;
    secondaryColor?: string;
}

export const RockBackground = ({ primaryColor = "#FF4500", secondaryColor = "#8B0000" }: RockBackgroundProps) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

    return (
        <div ref={ref} className="absolute inset-0 overflow-hidden bg-black">
            {/* Dark Grunge Texture */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `radial-gradient(circle, ${primaryColor}20 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Fire/Lava Gradient */}
            <motion.div
                className="absolute inset-0 opacity-40"
                style={{
                    background: `linear-gradient(180deg, ${secondaryColor}80, ${primaryColor}60, #000000)`,
                }}
                animate={{
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Fiery Sparks/Embers */}
            {[...Array(40)].map((_, i) => (
                <motion.div
                    key={`ember-${i}`}
                    className="absolute rounded-full"
                    style={{
                        width: 2 + Math.random() * 4,
                        height: 2 + Math.random() * 4,
                        background: i % 3 === 0 ? primaryColor : secondaryColor,
                        left: `${Math.random() * 100}%`,
                        bottom: `${Math.random() * 100}%`,
                        boxShadow: `0 0 ${4 + Math.random() * 6}px ${i % 3 === 0 ? primaryColor : secondaryColor}`
                    }}
                    animate={{
                        y: [-100, -400 - Math.random() * 300],
                        x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
                        opacity: [1, 0.8, 0],
                        scale: [1, 1.5, 0]
                    }}
                    transition={{
                        duration: 3 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                        ease: "easeOut"
                    }}
                />
            ))}

            {/* Jagged Lightning/Cracks */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={`crack-${i}`}
                    className="absolute h-[2px] origin-left opacity-30"
                    style={{
                        width: '50%',
                        background: `linear-gradient(90deg, ${primaryColor}, transparent)`,
                        top: `${15 + i * 15}%`,
                        left: `${i % 2 === 0 ? '0%' : '50%'}`,
                        transform: `rotate(${(Math.random() - 0.5) * 20}deg)`,
                        boxShadow: `0 0 10px ${primaryColor}`
                    }}
                    animate={{
                        opacity: [0.1, 0.4, 0.1],
                        scaleX: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Smoke/Fog Effect */}
            <motion.div
                className="absolute w-full h-64 bottom-0 opacity-20"
                style={{
                    background: `linear-gradient(to top, ${secondaryColor}80, transparent)`,
                    filter: 'blur(60px)',
                    y
                }}
                animate={{
                    opacity: [0.15, 0.3, 0.15]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Intense Radial Glow */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-30"
                style={{
                    background: `radial-gradient(circle, ${primaryColor}60 0%, ${secondaryColor}40 40%, transparent 70%)`,
                    filter: 'blur(80px)',
                    rotate
                }}
            />

            {/* Pulsing Vignette */}
            <motion.div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 30%, #00000080 100%)'
                }}
                animate={{
                    opacity: [0.5, 0.7, 0.5]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
};
