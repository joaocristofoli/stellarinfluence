import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface LifestyleBackgroundProps {
    primaryColor?: string;
    secondaryColor?: string;
}

export const LifestyleBackground = ({ primaryColor = "#FF6B9D", secondaryColor = "#C44569" }: LifestyleBackgroundProps) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    // Parallax effects
    const y1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, 200]);

    return (
        <div ref={ref} className="absolute inset-0 overflow-hidden">
            {/* Soft Gradient Background */}
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}20, #FFF5F5)`
                }}
            />

            {/* Organic Floating Shapes - Parallax Layer 1 */}
            <motion.div
                className="absolute w-[400px] h-[400px] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] opacity-20 blur-[60px]"
                style={{
                    background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
                    top: '10%',
                    left: '10%',
                    y: y1
                }}
                animate={{
                    borderRadius: [
                        "60% 40% 30% 70% / 60% 30% 70% 40%",
                        "30% 60% 70% 40% / 50% 60% 30% 60%",
                        "60% 40% 30% 70% / 60% 30% 70% 40%"
                    ],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            <motion.div
                className="absolute w-[500px] h-[500px] rounded-[30%_70%_70%_30%/30%_30%_70%_70%] opacity-15 blur-[80px]"
                style={{
                    background: `radial-gradient(circle, ${secondaryColor}, transparent)`,
                    bottom: '5%',
                    right: '5%',
                    y: y2
                }}
                animate={{
                    borderRadius: [
                        "30% 70% 70% 30% / 30% 30% 70% 70%",
                        "70% 30% 30% 70% / 70% 70% 30% 30%",
                        "30% 70% 70% 30% / 30% 30% 70% 70%"
                    ],
                    scale: [1, 1.2, 1]
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Parallax Layer 2 - Floating Circles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full opacity-10"
                    style={{
                        width: 100 + i * 40,
                        height: 100 + i * 40,
                        background: `radial-gradient(circle, ${i % 2 === 0 ? primaryColor : secondaryColor}, transparent)`,
                        left: `${15 + i * 12}%`,
                        top: `${20 + (i % 3) * 25}%`,
                        y: y3,
                        filter: 'blur(20px)'
                    }}
                    animate={{
                        y: [0, -40, 0],
                        scale: [1, 1.1, 1],
                        opacity: [0.08, 0.15, 0.08]
                    }}
                    transition={{
                        duration: 12 + i * 2,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Soft Sparkles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={`sparkle-${i}`}
                    className="absolute w-2 h-2 rounded-full bg-white"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        opacity: [0, 0.6, 0],
                        scale: [0, 1.5, 0]
                    }}
                    transition={{
                        duration: 4 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 4,
                        ease: "easeOut"
                    }}
                />
            ))}

            {/* Warm Glow */}
            <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-10"
                style={{
                    background: `radial-gradient(ellipse, ${primaryColor} 0%, transparent 60%)`,
                    filter: 'blur(100px)'
                }}
            />
        </div>
    );
};
