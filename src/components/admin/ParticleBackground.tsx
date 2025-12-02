import { motion } from "framer-motion";

interface ParticleBackgroundProps {
    count: number;
    size: number;
    speed: number;
    opacity: number;
    color: string;
}

export function ParticleBackground({ count, size, speed, opacity, color }: ParticleBackgroundProps) {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * speed,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                        width: size,
                        height: size,
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        backgroundColor: color,
                        opacity,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: speed * 3,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
