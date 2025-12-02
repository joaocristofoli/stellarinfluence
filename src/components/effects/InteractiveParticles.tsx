import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseX: number;
    baseY: number;
    isAttractor: boolean; // true = atração, false = repulsão
    opacity: number;
    opacityDirection: number; // 1 ou -1 para aumentar/diminuir
    floatAngle: number; // Ângulo para movimento de flutuação
    floatSpeed: number;
}

export function InteractiveParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Configuração do canvas
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Criar 90 partículas com velocidade inicial MUITO REDUZIDA
        const particleCount = 90;
        particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.05, // REDUZIDO de 0.3 para 0.05 (83% menos)
            vy: (Math.random() - 0.5) * 0.05,
            baseX: Math.random() * canvas.width,
            baseY: Math.random() * canvas.height,
            isAttractor: i % 2 === 1,
            opacity: Math.random() * 0.6 + 0.2,
            opacityDirection: Math.random() > 0.5 ? 1 : -1,
            floatAngle: Math.random() * Math.PI * 2,
            floatSpeed: 0.025 + Math.random() * 0.035, // AUMENTADOLIGEIRAMENTE de 0.02-0.05 para 0.025-0.06
        }));

        // Mouse tracking
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        // Touch/Click repulsion effect (mantido igual)
        const handleInteraction = (x: number, y: number) => {
            particlesRef.current.forEach((particle) => {
                const dx = x - particle.x;
                const dy = y - particle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const influenceRadius = 150;

                if (dist < influenceRadius && dist > 0) {
                    const force = (1 - dist / influenceRadius) * 3;
                    const normX = dx / dist;
                    const normY = dy / dist;

                    particle.vx -= normX * force;
                    particle.vy -= normY * force;
                }
            });
        };

        const handleClick = (e: MouseEvent) => {
            handleInteraction(e.clientX, e.clientY);
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleClick);
        window.addEventListener('touchstart', handleTouchStart);

        // Parâmetros de física - AUMENTADO impacto do mouse
        const influenceRadius = 200;
        const repulsionForce = 1.0; // DOBRADO de 0.5 para 1.0
        const attractionForce = 0.6; // DOBRADO de 0.3 para 0.6
        const returnForce = 0.02; // Força que puxa de volta para posição original
        const damping = 0.92; // Atrito para suavizar movimento
        const maxSpeed = 4;
        const floatAmplitude = 0.9; // AUMENTADO LIGEIRAMENTE de 0.8 para 0.9

        // Loop de animação
        const animate = () => {
            // Limpar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle) => {
                // Movimento de flutuação AUMENTADO
                particle.floatAngle += particle.floatSpeed;
                const floatX = Math.cos(particle.floatAngle) * floatAmplitude;
                const floatY = Math.sin(particle.floatAngle * 1.3) * floatAmplitude; // 1.3 para movimento orbital

                // Animação de opacidade (aparecer/desaparecer)
                particle.opacity += particle.opacityDirection * 0.003;
                if (particle.opacity >= 0.8) {
                    particle.opacity = 0.8;
                    particle.opacityDirection = -1;
                } else if (particle.opacity <= 0.1) {
                    particle.opacity = 0.1;
                    particle.opacityDirection = 1;
                }

                // Calcular distância do mouse
                const dx = mouseRef.current.x - particle.x;
                const dy = mouseRef.current.y - particle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Aplicar força do mouse (atração ou repulsão)
                if (dist < influenceRadius && dist > 0) {
                    const intensity = 1 - dist / influenceRadius; // Mais forte quanto mais perto
                    const force = particle.isAttractor ? attractionForce : repulsionForce;
                    const normX = dx / dist;
                    const normY = dy / dist;

                    if (particle.isAttractor) {
                        // Atração: puxar PARA o mouse
                        particle.vx += normX * intensity * force;
                        particle.vy += normY * intensity * force;
                    } else {
                        // Repulsão: empurrar PARA LONGE do mouse
                        particle.vx -= normX * intensity * force;
                        particle.vy -= normY * intensity * force;
                    }
                }

                // Força de retorno elástico (puxa de volta para posição base) + flutuação
                const returnDx = particle.baseX - particle.x + floatX;
                const returnDy = particle.baseY - particle.y + floatY;
                particle.vx += returnDx * returnForce;
                particle.vy += returnDy * returnForce;

                // Aplicar damping (atrito)
                particle.vx *= damping;
                particle.vy *= damping;

                // Limitar velocidade máxima
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (speed > maxSpeed) {
                    particle.vx = (particle.vx / speed) * maxSpeed;
                    particle.vy = (particle.vy / speed) * maxSpeed;
                }

                // Atualizar posição
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Desenhar partícula
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.isAttractor ? 2.5 : 1.5, 0, Math.PI * 2);

                // Cor diferente para atração vs repulsão
                if (particle.isAttractor) {
                    ctx.fillStyle = `rgba(147, 51, 234, ${particle.opacity})`; // Roxo para atração
                } else {
                    ctx.fillStyle = `rgba(255, 107, 53, ${particle.opacity})`; // Laranja para repulsão
                }

                ctx.fill();
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('touchstart', handleTouchStart);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
}
