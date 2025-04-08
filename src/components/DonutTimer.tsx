import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface DonutTimerProps {
    time: number;
    maxTime: number;
    isRunning: boolean;
}

export function DonutTimer({ time, maxTime, isRunning }: DonutTimerProps) {
    const circumference = 2 * Math.PI * 45;
    const controls = useAnimation();
    const prevTimeRef = useRef(maxTime);
    const animationRef = useRef<number>();
    const startTimeRef = useRef<number>(0);
    const totalDurationRef = useRef<number>(maxTime * 1000);

    useEffect(() => {
        // Réinitialiser l'animation quand le temps max change
        if (maxTime !== totalDurationRef.current / 1000) {
            totalDurationRef.current = maxTime * 1000;
            prevTimeRef.current = maxTime;
            controls.start({
                strokeDashoffset: 0,
                transition: { duration: 0 }
            });
        }
    }, [maxTime, controls]);

    useEffect(() => {
        if (isRunning) {
            startTimeRef.current = Date.now() - (maxTime - time) * 1000;
            animate();
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isRunning, time, maxTime]);

    const animate = () => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const remaining = Math.max(0, totalDurationRef.current - elapsed);
        const progress = elapsed / totalDurationRef.current;
        const currentTime = Math.ceil(maxTime - progress * maxTime);

        // Mettre à jour l'état visuel
        const strokeDashoffset = progress * circumference;
        controls.start({
            strokeDashoffset,
            transition: { duration: 0 }
        });

        // Synchroniser avec le temps principal si nécessaire
        if (currentTime !== time) {
            // Cette partie peut être ajustée selon vos besoins
        }

        if (progress < 1 && isRunning) {
            animationRef.current = requestAnimationFrame(animate);
        }
    };

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx="60"
                    cy="60"
                    r="45"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                    fill="none"
                />
                <motion.circle
                    cx="60"
                    cy="60"
                    r="45"
                    stroke="#FCD34D"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: 0 }}
                    animate={controls}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                    className={`text-3xl font-bold ${time <= 5 ? 'text-red-400' : 'text-yellow-400'}`}
                    animate={{ scale: time <= 5 ? [1, 1.1, 1] : 1 }}
                    transition={{ repeat: time <= 5 ? Infinity : 0, duration: 0.5 }}
                >
                    {time}
                </motion.span>
            </div>
        </div>
    );
}