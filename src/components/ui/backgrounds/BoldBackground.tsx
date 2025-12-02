import { motion, useScroll, useTransform, useVelocity, useSpring } from "framer-motion";
import { useRef } from "react";
import { LandingTheme } from "@/types/landingTheme";

interface BoldBackgroundProps {
    theme: LandingTheme;
    position?: 'fixed' | 'absolute';
}

export const BoldBackground = ({ theme, position = 'fixed' }: BoldBackgroundProps) => {
    const ref = useRef(null);
    const { scrollYProgress, scrollY } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });

    const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.5, 1]);

    // Velocity based skew
    const skew = useTransform(smoothVelocity, [-1000, 0, 1000], [-10, 0, 10]);

    const primaryColor = theme.primaryColor || "#FF6B35";
    const secondaryColor = theme.secondaryColor || "#E91E63";
    const backgroundColor = theme.backgroundColor || "#1A1A2E";

    return (
        <div ref={ref} className={`${position} inset-0 overflow-hidden z-[-1] bg-black`}>
            <div
                className="absolute inset-0"
                style={{ background: backgroundColor }}
            />

            {/* Dynamic Vortex Spiral */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] opacity-20"
                style={{
                    background: `conic-gradient(from 0deg, ${primaryColor}, transparent, ${secondaryColor}, transparent, ${primaryColor})`,
                    rotate,
                    scale,
                    filter: 'blur(80px)'
                }}
            />

            {/* High Contrast Geometric Shapes */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute border-[20px] rounded-full opacity-10"
                    style={{
                        width: `${(i + 1) * 20}vw`,
                        height: `${(i + 1) * 20}vw`,
                        borderColor: i % 2 === 0 ? primaryColor : secondaryColor,
                        top: '50%',
                        left: '50%',
                        x: '-50%',
                        y: '-50%',
                        rotate: useTransform(scrollYProgress, [0, 1], [0, (i + 1) * 90 * (i % 2 === 0 ? 1 : -1)]),
                        skew
                    }}
                />
            ))}

            {/* Glitch Lines */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={`glitch-${i}`}
                    className="absolute h-[2px] w-full opacity-30"
                    style={{
                        top: `${Math.random() * 100}%`,
                        background: i % 2 === 0 ? primaryColor : secondaryColor,
                        scaleX: useTransform(smoothVelocity, [-2000, 0, 2000], [1.5, 0.2, 1.5]),
                    }}
                />
            ))}

            {/* Vignette */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-80"
                style={{ background: 'radial-gradient(circle, transparent 40%, black 100%)' }}
            />
        </div>
    );
};
