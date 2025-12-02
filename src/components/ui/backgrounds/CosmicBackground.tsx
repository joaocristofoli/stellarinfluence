import { useEffect, useRef } from "react";
import { LandingTheme } from "@/types/landingTheme";

interface CosmicBackgroundProps {
    theme: LandingTheme;
    position?: 'fixed' | 'absolute';
}

export function CosmicBackground({ theme, position = 'fixed' }: CosmicBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Star[] = [];
        let mouseX = 0;
        let mouseY = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        class Star {
            x: number;
            y: number;
            size: number;
            baseX: number;
            baseY: number;
            speed: number;
            brightness: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.baseX = this.x;
                this.baseY = this.y;
                this.size = Math.random() * 2;
                this.speed = Math.random() * 0.05;
                this.brightness = Math.random();
            }

            update() {
                // Mouse repulsion
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;

                if (distance < maxDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * 5; // Repulsion strength
                    const directionY = forceDirectionY * force * 5;

                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Return to base position slowly
                    if (this.x !== this.baseX) {
                        const dx = this.x - this.baseX;
                        this.x -= dx * 0.02;
                    }
                    if (this.y !== this.baseY) {
                        const dy = this.y - this.baseY;
                        this.y -= dy * 0.02;
                    }
                }

                // Twinkle effect
                this.brightness += this.speed;
                if (this.brightness > 1 || this.brightness < 0) {
                    this.speed = -this.speed;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(this.brightness)})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initStars = () => {
            stars = [];
            const starCount = Math.floor((canvas!.width * canvas!.height) / 3000); // Density based on screen size
            for (let i = 0; i < starCount; i++) {
                stars.push(new Star());
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Nebula Gradient
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width
            );
            gradient.addColorStop(0, `${theme.secondaryColor}20`); // 20% opacity
            gradient.addColorStop(0.5, `${theme.primaryColor}10`); // 10% opacity
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                star.update();
                star.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouseX = e.touches[0].clientX;
                mouseY = e.touches[0].clientY;
            }
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <div className={`${position} inset-0 z-[-1]`} style={{ backgroundColor: theme.backgroundColor }}>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />
        </div>
    );
}
