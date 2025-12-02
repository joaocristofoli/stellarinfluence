import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

export function Hero() {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    // Use MotionValues for smooth mouse tracking  
    const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 960);
    const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 540);

    const y1 = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 0.6], [0, -150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // Mouse tracking with throttling
    useEffect(() => {
        let frameId: number;
        let lastUpdate = 0;
        const throttleMs = 100;

        const handleMouseMove = (e: MouseEvent) => {
            const now = Date.now();
            if (now - lastUpdate < throttleMs) return;

            lastUpdate = now;
            frameId = requestAnimationFrame(() => {
                mouseX.set(e.clientX);
                mouseY.set(e.clientY);
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, [mouseX, mouseY]);

    // Ultra-smooth gradient following
    const gradientX = useTransform(mouseX, (x) => (x / (typeof window !== 'undefined' ? window.innerWidth : 1920)) * 100);
    const gradientY = useTransform(mouseY, (y) => (y / (typeof window !== 'undefined' ? window.innerHeight : 1080)) * 100);

    const smoothGradientX = useSpring(gradientX, { stiffness: 30, damping: 80 });
    const smoothGradientY = useSpring(gradientY, { stiffness: 30, damping: 80 });

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
        >
            {/* Holographic Background - Muito menor 120px */}
            <motion.div
                className="absolute inset-0 opacity-40"
                style={{
                    background: useMotionTemplate`radial-gradient(circle 120px at ${smoothGradientX}% ${smoothGradientY}%, rgba(255,107,53,0.3) 0%, rgba(147,51,234,0.2) 50%, transparent 100%)`,
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

            {/* Floating Particles with Antigravity Effect - 20 particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => {
                    const fixedLeft = (i * 5 + 2.5) % 100;
                    const fixedTop = ((i * 23) % 90) + 5;

                    return (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-accent"
                            style={{
                                left: `${fixedLeft}%`,
                                top: `${fixedTop}%`,
                                x: useTransform(mouseX, (mx) => {
                                    const particleX = (fixedLeft / 100) * (typeof window !== 'undefined' ? window.innerWidth : 1920);
                                    const distance = mx - particleX;
                                    const maxPush = 80;
                                    const minDistance = 200;

                                    if (Math.abs(distance) < minDistance) {
                                        const force = (1 - Math.abs(distance) / minDistance);
                                        return -Math.sign(distance) * force * maxPush;
                                    }
                                    return 0;
                                }),
                                y: useTransform(mouseY, (my) => {
                                    const particleY = (fixedTop / 100) * (typeof window !== 'undefined' ? window.innerHeight : 1080);
                                    const distance = my - particleY;
                                    const maxPush = 80;
                                    const minDistance = 200;

                                    if (Math.abs(distance) < minDistance) {
                                        const force = (1 - Math.abs(distance) / minDistance);
                                        return -Math.sign(distance) * force * maxPush;
                                    }
                                    return 0;
                                }),
                            }}
                            animate={{
                                opacity: [0.2, 0.8, 0.2],
                                scale: [0.8, 1.2, 0.8],
                            }}
                            transition={{
                                duration: 4 + (i * 0.2),
                                repeat: Infinity,
                                delay: i * 0.3,
                                ease: "easeInOut",
                            }}
                        />
                    );
                })}
            </div>

            {/* Main Content - [REST OF HERO CONTENT UNCHANGED] */}
