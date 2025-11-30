import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface ElegantBackgroundProps {
    primaryColor?: string;
    secondaryColor?: string;
}

export const ElegantBackground = ({ primaryColor = "#D4AF37", secondaryColor = "#1A1A2E" }: ElegantBackgroundProps) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0.2]);

    return (
        <div ref={ref} className="absolute inset-0 overflow-hidden">
            {/* Smooth Gradient Base */}
            <motion.div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse at top, ${primaryColor}15, ${secondaryColor}30)`,
                    opacity
                }}
            />

            {/* Floating Ornamental Circles */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border opacity-20"
                    style={{
                        width: 200 + i * 80,
                        height: 200 + i * 80,
                        borderColor: i % 2 === 0 ? primaryColor : 'white',
                        borderWidth: '1px',
                        left: `${20 + (i % 3) * 30}%`,
                        top: `${10 + (i % 4) * 25}%`,
                        y
                    }}
                    animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, i % 2 === 0 ? 360 : -360],
                    }}
                    transition={{
                        duration: 20 + i * 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Elegant Light Rays */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={`ray-${i}`}
                    className="absolute h-full w-[2px] origin-top opacity-10"
                    style={{
                        left: `${15 + i * 20}%`,
                        top: 0,
                        background: `linear-gradient(to bottom, ${primaryColor}, transparent)`,
                        transform: `rotate(${5 + i * 3}deg)`
                    }}
                    animate={{
                        opacity: [0.05, 0.15, 0.05],
                        scaleY: [0.8, 1, 0.8]
                    }}
                    transition={{
                        duration: 8 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Subtle Shimmer Particles */}
            {[...Array(25)].map((_, i) => (
                <motion.div
                    key={`shimmer-${i}`}
                    className="absolute w-1 h-1 rounded-full bg-white"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.5, 0],
                        y: [-50, -150]
                    }}
                    transition={{
                        duration: 6 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "easeOut"
                    }}
                />
            ))}

            {/* Soft Glow Overlay */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-20"
                style={{
                    background: `radial-gradient(circle, ${primaryColor}60 0%, transparent 70%)`,
                    filter: 'blur(80px)'
                }}
            />
        </div>
    );
};
