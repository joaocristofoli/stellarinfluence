import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TouchRipple {
    id: number;
    x: number;
    y: number;
}

export function TouchRippleEffect() {
    const [ripples, setRipples] = useState<TouchRipple[]>([]);

    useEffect(() => {
        const handleTouch = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (!touch) return;

            const newRipple: TouchRipple = {
                id: Date.now(),
                x: touch.clientX,
                y: touch.clientY,
            };

            setRipples(prev => [...prev, newRipple]);

            // Remove ripple after animation
            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== newRipple.id));
            }, 1000);
        };

        const handleClick = (e: MouseEvent) => {
            const newRipple: TouchRipple = {
                id: Date.now(),
                x: e.clientX,
                y: e.clientY,
            };

            setRipples(prev => [...prev, newRipple]);

            // Remove ripple after animation
            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== newRipple.id));
            }, 1000);
        };

        document.addEventListener('touchstart', handleTouch);
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('touchstart', handleTouch);
            document.removeEventListener('click', handleClick);
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {ripples.map((ripple) => (
                <motion.div
                    key={ripple.id}
                    className="absolute rounded-full border-2 border-accent/50"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ width: 0, height: 0, opacity: 0.8 }}
                    animate={{
                        width: 100,
                        height: 100,
                        opacity: 0,
                    }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            ))}
        </div>
    );
}
