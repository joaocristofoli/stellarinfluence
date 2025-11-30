
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";

export function Hero() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Parallax
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    // Mouse tracking
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const gradientX = useSpring((mousePosition.x / window.innerWidth) * 100, {
        stiffness: 100,
        damping: 30,
    });

    const gradientY = useSpring((mousePosition.y / window.innerHeight) * 100, {
        stiffness: 100,
        damping: 30,
    });

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
        >
            {/* Holographic Background */}
            <motion.div
                className="absolute inset-0 opacity-40"
                style={{
                    background: `radial-gradient(circle at ${gradientX}% ${gradientY}%, rgba(255,107,53,0.3) 0%, rgba(147,51,234,0.2) 50%, transparent 100%)`,
                }}
            />

            {/* Grid */}
            <div className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,107,53,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,53,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: "50px 50px",
                }}
            />

            {/* 3D Sphere */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 md:opacity-30">
                <motion.div
                    animate={{
                        rotateY: [0, 360],
                        rotateX: [0, 15, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(255,107,53,0.4) 0%, rgba(147,51,234,0.2) 100%)",
                        filter: "blur(60px)",
                    }}
                />
            </div>

            {/* Floating Particles - Reduced count for performance */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-accent"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            willChange: "transform, opacity"
                        }}
                        animate={{
                            y: [-20, 20],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <motion.div
                style={{ opacity: heroOpacity }}
                className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28"
            >
                <div className="text-center max-w-5xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium border border-accent/30 mb-8"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles className="w-4 h-4 text-accent" />
                        </motion.div>
                        <span className="text-sm font-medium bg-gradient-to-r from-accent via-purple-400 to-blue-400 bg-clip-text text-transparent">
                            A Nova Era do Marketing Digital
                        </span>
                    </motion.div>

                    {/* Title with Particle Disintegration */}
                    <motion.h1
                        style={{ y: y1 }}
                        className="font-bold mb-6 leading-[1.1] tracking-tight"
                    >
                        {/* CONECTAMOS - Mobile Optimized */}
                        <motion.div
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 sm:mb-3"
                            style={{ letterSpacing: "0.02em" }}
                        >
                            {["C", "O", "N", "E", "C", "T", "A", "M", "O", "S"].map((letter, i) => {
                                const totalLetters = 10;
                                const middle = totalLetters / 2;
                                const distanceFromMiddle = Math.abs(i - middle);
                                const spacing = distanceFromMiddle * 0.08;

                                return (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, y: 50, rotateX: -90 }}
                                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                        style={{
                                            display: "inline-block",
                                            marginRight: `${spacing}em`,
                                            opacity: useTransform(scrollYProgress, [0.3 + i * 0.01, 0.4 + i * 0.01], [1, 0]),
                                            scale: useTransform(scrollYProgress, [0.3 + i * 0.01, 0.4 + i * 0.01], [1, 0.5]),
                                            willChange: "transform, opacity"
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            delay: i * 0.05,
                                            type: "spring",
                                            stiffness: 100,
                                        }}
                                        className="text-white"
                                    >
                                        {letter}
                                    </motion.span>
                                );
                            })}
                        </motion.div>

                        {/* CRIADORES - Mobile Optimized */}
                        <motion.div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl my-2 sm:my-4 relative">
                            {["C", "R", "I", "A", "D", "O", "R", "E", "S"].map((letter, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    style={{
                                        display: "inline-block",
                                        opacity: useTransform(scrollYProgress, [0.35 + i * 0.008, 0.45 + i * 0.008], [1, 0]),
                                        y: useTransform(scrollYProgress, [0.35 + i * 0.008, 0.45 + i * 0.008], [0, -50]),
                                        background: "linear-gradient(135deg, #FF6B35 0%, #F7B801 25%, #00D9FF 50%, #9333EA 75%, #FF6B35 100%)",
                                        backgroundSize: "300% 300%",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        willChange: "transform, opacity"
                                    }}
                                    transition={{ duration: 0.9, delay: 0.5 + i * 0.05 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                    }}
                                >
                                    {letter}
                                </motion.span>
                            ))}
                        </motion.div>

                        {/* AO FUTURO - Mobile Optimized */}
                        <motion.div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-2 sm:mt-3" style={{ letterSpacing: "0.05em" }}>
                            {["A", "O", " ", "F", "U", "T", "U", "R", "O"].map((letter, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        display: "inline-block",
                                        opacity: useTransform(scrollYProgress, [0.4 + i * 0.012, 0.5 + i * 0.012], [1, 0]),
                                        scale: useTransform(scrollYProgress, [0.4 + i * 0.012, 0.5 + i * 0.012], [1, 0.3]),
                                        willChange: "transform, opacity"
                                    }}
                                    transition={{ duration: 1, delay: 0.8 + i * 0.05 }}
                                    className="text-white/90"
                                >
                                    {letter === " " ? "\u00A0" : letter}
                                </motion.span>
                            ))}
                        </motion.div>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        style={{
                            y: y2,
                            opacity: useTransform(scrollYProgress, [0.5, 0.65], [1, 0]),
                            // Removed blur for performance
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1 }}
                        className="text-base sm:text-lg md:text-xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed"
                    >
                        Plataforma <span className="text-accent font-semibold">premium</span> que transforma marcas em{" "}
                        <span className="text-gradient-premium font-semibold">fenômenos digitais</span>
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        style={{
                            opacity: useTransform(scrollYProgress, [0.5, 0.7], [1, 0]),
                            scale: useTransform(scrollYProgress, [0.5, 0.7], [1, 0.8]),
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1.2 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="lg"
                                className="relative overflow-hidden bg-gradient-to-r from-accent to-orange-600 text-white px-8 py-6 text-lg rounded-full group border-0"
                                onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                <span className="relative z-10 flex items-center">
                                    Começar Agora
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="lg"
                                variant="outline"
                                className="px-8 py-6 text-lg rounded-full glass-premium border-accent/30 hover:bg-accent/10 text-white"
                                onClick={() => document.getElementById("creators")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                Ver Criadores
                            </Button>
                        </motion.div>
                    </motion.div>

                </div>
            </motion.div>

            {/* Scroll Indicator - Mobile Optimized */}
            <motion.div
                style={{ opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]) }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] uppercase tracking-widest text-white/50">Scroll</span>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-5 h-8 sm:w-6 sm:h-10 border border-white/20 rounded-full flex items-start justify-center p-1.5 glass-premium"
                >
                    <motion.div
                        className="w-0.5 h-1.5 sm:w-1 sm:h-2 bg-gradient-to-b from-accent to-purple-500 rounded-full"
                        animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>
            </motion.div>

            {/* Smooth Transition Gradient to Next Section - Fixed to black to avoid white bar */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-black z-10 pointer-events-none" />
        </section>
    );
}
