import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Search, Wand2, Sparkles, Telescope, Fingerprint, ScanEye, Zap, Ghost } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface IdentificationClue {
    text: string;
    points: number;
    revealed: boolean;
}

interface Team {
    id: string;
    name: string;
    color: string;
}

export interface IdentificationQuestionProps {
    question: {
        id: string;
        text: string;
        hint?: string;
        type: 'identification';
        clues?: IdentificationClue[];
        solution?: string;
    };
    teams: Team[];
}

export const IdentificationQuestion: React.FC<IdentificationQuestionProps> = ({ question, teams }) => {
    const [revealedClues, setRevealedClues] = useState<number[]>([]);
    const [showSolution, setShowSolution] = useState(false);
    const [userGuess, setUserGuess] = useState('');
    const [hasGuessed, setHasGuessed] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [revealingClue, setRevealingClue] = useState<number | null>(null);
    const [spookyMode, setSpookyMode] = useState(false);

    useEffect(() => {
        setSpookyMode(Math.random() < 0.2);
        const introTimer = setTimeout(() => {
            setShowIntro(false);
            if (question.clues?.length) {
                setTimeout(() => handleRevealClue(0), 1000);
            }
        }, 3500);
        return () => clearTimeout(introTimer);
    }, []);

    const handleRevealClue = async (index: number) => {
        if (revealedClues.includes(index)) return;
        setRevealingClue(index);
        await new Promise(resolve => setTimeout(resolve, 800));

        confetti({
            particleCount: 80,
            angle: 270,
            spread: 30,
            origin: { x: 0.5, y: 0 },
            colors: spookyMode ? ['#8b5cf6', '#ec4899', '#d946ef'] : ['#f59e0b', '#3b82f6', '#10b981'],
            shapes: ['circle', 'star']
        });

        setRevealedClues([...revealedClues, index]);
        setRevealingClue(null);
    };

    const handleShowSolution = () => {
        setShowSolution(true);
        confetti({
            particleCount: 300,
            spread: 100,
            origin: { y: 0.6 },
            colors: spookyMode ? ['#8b5cf6', '#ec4899'] : ['#10b981', '#84cc16', '#f59e0b'],
            shapes: ['circle', 'star'],
            scalar: 1.5
        });
    };

    const handleSubmitGuess = () => {
        setHasGuessed(true);
        if (userGuess.toLowerCase() === question.solution?.toLowerCase()) {
            confetti({
                particleCount: 400,
                spread: 120,
                origin: { y: 0.6 },
                colors: spookyMode ? ['#8b5cf6', '#ec4899', '#a855f7'] : ['#10b981', '#84cc16', '#f59e0b'],
                shapes: ['circle', 'star'],
                scalar: 2
            });
        }
    };

    const primaryColor = spookyMode ? '#8b5cf6' : '#f59e0b';
    const secondaryColor = spookyMode ? '#ec4899' : '#3b82f6';
    const bgColor = spookyMode ? 'bg-gray-900' : 'bg-gray-800';
    const textColor = spookyMode ? 'text-purple-400' : 'text-yellow-400';

    return (
        <div className={`relative overflow-hidden min-h-[600px] ${bgColor} text-white`}>
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-50"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div className="text-center space-y-12">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.h1
                                    animate={{
                                        textShadow: [
                                            `0 0 10px ${primaryColor}`,
                                            `0 0 20px ${secondaryColor}`,
                                            `0 0 30px ${primaryColor}`
                                        ],
                                        y: [0, -10, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                                    className="text-7xl font-bold"
                                    style={{ color: primaryColor }}
                                >
                                    {spookyMode ? 'MYSTÈRE' : 'IDENTIFICATION'}
                                </motion.h1>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 1.5, duration: 0.8 } }}
                                className="flex flex-col items-center"
                            >
                                <motion.div
                                    initial={{ x: -200, opacity: 0 }}
                                    animate={{
                                        x: 0,
                                        opacity: 1,
                                        transition: { delay: 1.8, type: 'spring', stiffness: 200 }
                                    }}
                                    className="text-3xl font-bold mb-2"
                                    style={{ color: teams[0].color }}
                                >
                                    {teams[0].name}
                                </motion.div>

                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1, transition: { delay: 2.2, duration: 0.5 } }}
                                    className="h-1 w-64 bg-gradient-to-r from-transparent via-white to-transparent my-4"
                                />

                                <motion.div
                                    initial={{ x: 200, opacity: 0 }}
                                    animate={{
                                        x: 0,
                                        opacity: 1,
                                        transition: { delay: 2.5, type: 'spring', stiffness: 200 }
                                    }}
                                    className="text-3xl font-bold mt-2"
                                    style={{ color: teams[1].color }}
                                >
                                    {teams[1].name}
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: 3, duration: 0.8 } }}
                                className="pt-8"
                            >
                                <motion.p className="text-2xl text-white/80 mb-4">
                                    {spookyMode ? 'Un défi spectral vous attend...' : 'Préparez-vous pour le défi !'}
                                </motion.p>
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 2 } }}
                                    className="text-4xl"
                                >
                                    {spookyMode ? '👻' : '🕵️‍♂️'}
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {spookyMode ? (
                            [...Array(15)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute text-3xl text-purple-400"
                                    initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0 }}
                                    animate={{
                                        x: Math.random() * window.innerWidth,
                                        y: Math.random() * window.innerHeight,
                                        opacity: [0, 0.8, 0],
                                        rotate: 360
                                    }}
                                    transition={{ duration: Math.random() * 4 + 3, repeat: Infinity, delay: Math.random() * 2 }}
                                >
                                    👻
                                </motion.div>
                            ))
                        ) : (
                            [...Array(30)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute text-2xl text-yellow-400"
                                    initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, scale: 0, opacity: 0 }}
                                    animate={{
                                        x: Math.random() * window.innerWidth,
                                        y: Math.random() * window.innerHeight,
                                        scale: [0, 1, 0],
                                        opacity: [0, 1, 0],
                                        rotate: 360
                                    }}
                                    transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 1.5 }}
                                >
                                    {['✨', '⚡', '🔍', '🕵️', '🔎'][i % 5]}
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Le reste du composant reste inchangé mais avec les mêmes corrections appliquées */}
            {/* ... */}
        </div>
    );
};