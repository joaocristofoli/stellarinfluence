import { motion } from "framer-motion";

interface BackgroundProps {
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
    };
    position?: 'fixed' | 'absolute';
}

export const RockBackground = ({ theme, position = 'fixed' }: BackgroundProps) => {
    const primaryColor = theme?.primaryColor || '#FF4500';
    const secondaryColor = theme?.secondaryColor || '#8B0000';
    const bgColor = theme?.backgroundColor || '#110505';

    return (
        <div className={`${position} inset-0 overflow-hidden pointer-events-none z-[-1]`} style={{ backgroundColor: bgColor }}>
            {/* Dark Gradient Overlay */}
            <div
                className="absolute inset-0 opacity-60"
                style={{
                    background: `linear-gradient(to top, ${secondaryColor}40 0%, transparent 100%)`
                }}
            />

            {/* Rising Sparks/Fire Particles */}
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full blur-[1px]"
                    style={{
                        width: Math.random() * 4 + 2 + 'px',
                        height: Math.random() * 4 + 2 + 'px',
                        left: `${Math.random() * 100}%`,
                        bottom: '-10px',
                        backgroundColor: i % 3 === 0 ? '#FFFFFF' : (i % 2 === 0 ? '#FFA500' : primaryColor),
                        boxShadow: `0 0 ${Math.random() * 10 + 5}px ${primaryColor}`,
                    }}
                    animate={{
                        y: [0, -window.innerHeight * 1.2],
                        x: [0, (Math.random() - 0.5) * 50],
                        opacity: [0, 1, 0],
                        scale: [0.5, 1.5, 0],
                    }}
                    transition={{
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "easeOut"
                    }}
                />
            ))}

            {/* Heat Haze / Pulsing Glow at Bottom */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-[30vh] opacity-30 blur-[50px]"
                style={{
                    background: `linear-gradient(to top, ${primaryColor}, transparent)`,
                }}
                animate={{
                    opacity: [0.2, 0.4, 0.2],
                    height: ['30vh', '35vh', '30vh'],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
};
