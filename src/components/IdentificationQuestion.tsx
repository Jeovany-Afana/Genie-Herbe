// src/components/IdentificationQuestion.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Search, Wand2, Sparkles, Telescope, Fingerprint, ScanEye, Zap, Ghost } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface IdentificationClue {
    text: string;
    points: number;
    revealed: boolean;
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
}

export const IdentificationQuestion: React.FC<IdentificationQuestionProps> = ({ question }) => {
    const [revealedClues, setRevealedClues] = useState<number[]>([]);
    const [showSolution, setShowSolution] = useState(false);
    const [userGuess, setUserGuess] = useState('');
    const [hasGuessed, setHasGuessed] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [revealingClue, setRevealingClue] = useState<number | null>(null);
    const [spookyMode, setSpookyMode] = useState(false);

    // Séquence d'intro spectaculaire
    useEffect(() => {
        // Mode aléatoire "spooky" (1 chance sur 5)
        setSpookyMode(Math.random() < 0.2);

        const introTimer = setTimeout(() => {
            setShowIntro(false);

            // Premier indice révélé après l'intro
            if (question.clues?.length) {
                setTimeout(() => handleRevealClue(0), 1000);
            }
        }, 3500);

        return () => clearTimeout(introTimer);
    }, []);

    const handleRevealClue = async (index: number) => {
        if (revealedClues.includes(index)) return;

        setRevealingClue(index);

        // Animation avant révélation
        await new Promise(resolve => setTimeout(resolve, 800));

        // Confetti directionnel
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

        // Grande explosion de confettis
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
            // Explosion de victoire
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

    // Couleurs dynamiques en fonction du mode
    const primaryColor = spookyMode ? '#8b5cf6' : '#f59e0b';
    const secondaryColor = spookyMode ? '#ec4899' : '#3b82f6';
    const bgColor = spookyMode ? 'bg-gray-900' : 'bg-gray-800';
    const textColor = spookyMode ? 'text-purple-400' : 'text-yellow-400';

    return (
        <div className={`relative overflow-hidden min-h-[600px] ${bgColor} text-white`}>
            {/* Animation d'intro spectaculaire */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-50"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Effet de balayage laser */}
                        <motion.div
                            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                            initial={{ y: 0 }}
                            animate={{ y: "100vh" }}
                            transition={{ duration: 1.5, ease: "linear" }}
                        />

                        {/* Titre holographique */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                transition: {
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 10
                                }
                            }}
                            exit={{
                                opacity: 0,
                                scale: 1.5,
                                transition: {
                                    ease: "circIn",
                                    duration: 0.5
                                }
                            }}
                            className="text-center"
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
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                                className="text-7xl font-bold mb-6"
                                style={{ color: primaryColor }}
                            >
                                {spookyMode ? 'MYSTÈRE' : 'IDENTIFICATION'}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    transition: { delay: 1 }
                                }}
                                className="text-2xl text-white/80"
                            >
                                {spookyMode ? 'Un spectre hante cette énigme...' : 'Préparez-vous à résoudre le mystère...'}
                            </motion.p>
                        </motion.div>

                        {/* Effets spéciaux */}
                        {spookyMode ? (
                            <>
                                {[...Array(15)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute text-3xl text-purple-400"
                                        initial={{
                                            x: Math.random() * window.innerWidth,
                                            y: Math.random() * window.innerHeight,
                                            opacity: 0
                                        }}
                                        animate={{
                                            x: Math.random() * window.innerWidth,
                                            y: Math.random() * window.innerHeight,
                                            opacity: [0, 0.8, 0],
                                            rotate: 360
                                        }}
                                        transition={{
                                            duration: Math.random() * 4 + 3,
                                            repeat: Infinity,
                                            delay: Math.random() * 2
                                        }}
                                    >
                                        👻
                                    </motion.div>
                                ))}
                            </>
                        ) : (
                            <>
                                {[...Array(30)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute text-2xl text-yellow-400"
                                        initial={{
                                            x: Math.random() * window.innerWidth,
                                            y: Math.random() * window.innerHeight,
                                            scale: 0,
                                            opacity: 0
                                        }}
                                        animate={{
                                            x: Math.random() * window.innerWidth,
                                            y: Math.random() * window.innerHeight,
                                            scale: [0, 1, 0],
                                            opacity: [0, 1, 0],
                                            rotate: 360
                                        }}
                                        transition={{
                                            duration: Math.random() * 3 + 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 1.5
                                        }}
                                    >
                                        {['✨', '⚡', '🔍', '🕵️', '🔎'][i % 5]}
                                    </motion.div>
                                ))}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contenu principal */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: showIntro ? 3.5 : 0 }}
                className="space-y-8 p-6"
            >
                {/* En-tête */}
                <motion.div
                    initial={{ y: -50 }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 4,
                            ease: "easeInOut"
                        }}
                        className="text-5xl mb-4"
                    >
                        {spookyMode ? '👻' : '🕵️‍♂️'}
                    </motion.div>
                    <h2
                        className="text-3xl font-bold mb-2"
                        style={{
                            background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        {question.text}
                    </h2>
                    {question.hint && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg italic text-white/70"
                        >
                            {question.hint}
                        </motion.p>
                    )}
                </motion.div>

                {/* Indices */}
                <div className="space-y-4">
                    <h3 className={`text-xl font-semibold flex items-center gap-2 ${textColor}`}>
                        <motion.div
                            animate={{
                                rotate: [0, 20, -20, 0],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 3,
                                ease: "easeInOut"
                            }}
                        >
                            {spookyMode ? <Ghost className="h-6 w-6" /> : <Telescope className="h-6 w-6" />}
                        </motion.div>
                        Indices à découvrir
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        {question.clues?.map((clue, index) => (
                            <motion.div
                                key={index}
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: { delay: index * 0.1 + 0.5 }
                                }}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => handleRevealClue(index)}
                                className={`p-5 rounded-xl cursor-pointer transition-all relative overflow-hidden border-2 ${
                                    revealedClues.includes(index)
                                        ? spookyMode
                                            ? 'border-purple-500 bg-purple-900/20'
                                            : 'border-yellow-400 bg-yellow-900/20'
                                        : 'border-gray-700 bg-gray-800 hover:border-yellow-400/50'
                                }`}
                            >
                                {/* Animation de révélation */}
                                <AnimatePresence>
                                    {revealingClue === index && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{
                                                scale: 10,
                                                opacity: 0,
                                                transition: { duration: 0.8 }
                                            }}
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: spookyMode
                                                    ? 'radial-gradient(circle, rgba(139,92,246,0.8) 0%, rgba(139,92,246,0) 70%)'
                                                    : 'radial-gradient(circle, rgba(245,158,11,0.8) 0%, rgba(245,158,11,0) 70%)'
                                            }}
                                        />
                                    )}
                                </AnimatePresence>

                                <div className="flex items-center gap-4">
                                    <motion.div
                                        className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                                            revealedClues.includes(index)
                                                ? spookyMode
                                                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                                    : 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-blue-900'
                                                : 'bg-gray-700 text-gray-400'
                                        }`}
                                        animate={{
                                            rotate: revealedClues.includes(index) ? 360 : 0,
                                            scale: revealingClue === index ? [1, 1.2, 1] : 1
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            ease: "easeOut"
                                        }}
                                    >
                                        {revealedClues.includes(index) ? (
                                            <Check className="h-6 w-6" />
                                        ) : (
                                            <Lock className="h-5 w-5" />
                                        )}
                                    </motion.div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className={`font-medium ${
                                                revealedClues.includes(index)
                                                    ? textColor
                                                    : 'text-gray-400'
                                            }`}>
                                                Indice {index + 1} - {clue.points}pts
                                            </span>
                                            {revealedClues.includes(index) && (
                                                <motion.span
                                                    animate={{
                                                        scale: [1, 1.3, 1],
                                                        rotate: [0, 15, -15, 0]
                                                    }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 2.5,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="text-2xl"
                                                >
                                                    {spookyMode
                                                        ? ['👻', '💀', '🕷️', '🕸️', '🧛'][index % 5]
                                                        : ['🔎', '🧩', '💎', '🔦', '📜'][index % 5]}
                                                </motion.span>
                                            )}
                                        </div>

                                        <AnimatePresence>
                                            {revealedClues.includes(index) ? (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{
                                                        opacity: 1,
                                                        height: 'auto',
                                                        transition: { delay: 0.3 }
                                                    }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-2"
                                                >
                                                    <motion.p
                                                        className="text-white text-lg"
                                                        initial={{ opacity: 0 }}
                                                        animate={{
                                                            opacity: 1,
                                                            transition: { delay: 0.5 }
                                                        }}
                                                    >
                                                        {clue.text}
                                                    </motion.p>
                                                </motion.div>
                                            ) : (
                                                <motion.p
                                                    className="text-gray-400 italic mt-2"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    Cliquez pour révéler
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Zone de réponse */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4"
                >
                    <h3 className={`text-xl font-semibold flex items-center gap-2 ${textColor}`}>
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 3,
                                ease: "easeInOut"
                            }}
                        >
                            {spookyMode ? <Zap className="h-6 w-6" /> : <Fingerprint className="h-6 w-6" />}
                        </motion.div>
                        Votre hypothèse
                    </h3>

                    <div className="flex gap-3">
                        <motion.div
                            className="flex-1 relative"
                            whileHover={{ y: -3 }}
                        >
                            <input
                                type="text"
                                value={userGuess}
                                onChange={(e) => setUserGuess(e.target.value)}
                                placeholder={spookyMode ? "Quel est ce spectre ?" : "Qui ou quoi suis-je ?"}
                                className={`w-full px-5 py-3 bg-gray-700 border-2 rounded-xl text-white placeholder-gray-400 outline-none text-lg ${
                                    hasGuessed
                                        ? userGuess.toLowerCase() === question.solution?.toLowerCase()
                                            ? 'border-green-500'
                                            : 'border-red-500'
                                        : spookyMode
                                            ? 'border-purple-500 focus:border-pink-500'
                                            : 'border-yellow-400 focus:border-yellow-500'
                                }`}
                                disabled={hasGuessed}
                            />
                            {!userGuess && (
                                <motion.div
                                    animate={{
                                        opacity: [0.3, 0.7, 0.3],
                                        x: [0, 5, 0]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                >
                                    ?
                                </motion.div>
                            )}
                        </motion.div>

                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow: spookyMode
                                    ? '0 0 15px rgba(139, 92, 246, 0.5)'
                                    : '0 0 15px rgba(245, 158, 11, 0.5)'
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmitGuess}
                            disabled={!userGuess.trim() || hasGuessed}
                            className={`px-6 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 ${
                                spookyMode
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900'
                            }`}
                        >
                            <motion.span
                                animate={{
                                    scale: [1, 1.2, 1],
                                    transition: { repeat: Infinity, duration: 2 }
                                }}
                            >
                                {spookyMode ? '👁️' : '🔍'}
                            </motion.span>
                            Valider
                        </motion.button>
                    </div>

                    {/* Feedback */}
                    {hasGuessed && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                transition: { type: 'spring', stiffness: 300 }
                            }}
                            className={`p-4 rounded-xl text-center font-bold text-lg ${
                                userGuess.toLowerCase() === question.solution?.toLowerCase()
                                    ? 'bg-green-900/30 border-2 border-green-500 text-green-400'
                                    : 'bg-red-900/30 border-2 border-red-500 text-red-400'
                            }`}
                        >
                            {userGuess.toLowerCase() === question.solution?.toLowerCase() ? (
                                <div className="flex items-center justify-center gap-2">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            rotate: [0, 360]
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="text-2xl"
                                    >
                                        {spookyMode ? '👏' : '🎯'}
                                    </motion.div>
                                    <span>{spookyMode ? 'Exorcisme réussi !' : 'Brillante déduction !'}</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="text-2xl"
                                    >
                                        {spookyMode ? '👻' : '❌'}
                                    </motion.div>
                                    <span>{spookyMode ? 'Le spectre résiste...' : 'Essayez encore !'}</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </motion.div>

                {/* Solution */}
                <AnimatePresence>
                    {(revealedClues.length === question.clues?.length || showSolution) && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                transition: { delay: 0.3, type: 'spring' }
                            }}
                            exit={{ opacity: 0 }}
                            className={`p-6 rounded-xl border-2 mt-6 text-center ${
                                spookyMode
                                    ? 'bg-purple-900/20 border-purple-500'
                                    : 'bg-yellow-900/20 border-yellow-500'
                            }`}
                        >
                            <div className="flex flex-col items-center">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        y: [0, -5, 0]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 3,
                                        ease: "easeInOut"
                                    }}
                                    className="text-5xl mb-4"
                                >
                                    {spookyMode ? '🏆' : '🎉'}
                                </motion.div>

                                <h4 className={`text-2xl font-bold mb-3 ${
                                    spookyMode ? 'text-purple-400' : 'text-yellow-400'
                                }`}>
                                    {spookyMode ? 'Le mystère est élucidé' : 'Solution révélée'}
                                </h4>

                                <motion.p
                                    initial={{ scale: 0.5 }}
                                    animate={{
                                        scale: 1,
                                        transition: {
                                            type: 'spring',
                                            stiffness: 300
                                        }
                                    }}
                                    className={`text-3xl font-bold mb-6 ${
                                        spookyMode ? 'text-white' : 'text-white'
                                    }`}
                                >
                                    {question.solution}
                                </motion.p>

                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 3,
                                        ease: "easeInOut"
                                    }}
                                    className="text-4xl"
                                >
                                    {spookyMode ? '👏' : '🎊'}
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bouton solution */}
                {!showSolution && revealedClues.length < (question.clues?.length || 0) && (
                    <motion.button
                        whileHover={{
                            scale: 1.02,
                            boxShadow: spookyMode
                                ? '0 0 20px rgba(139, 92, 246, 0.5)'
                                : '0 0 20px rgba(16, 185, 129, 0.4)'
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleShowSolution}
                        className={`w-full py-3 rounded-xl font-bold text-lg mt-6 flex items-center justify-center gap-2 ${
                            spookyMode
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                        }`}
                    >
                        <Sparkles className="h-5 w-5" />
                        {spookyMode ? 'Révéler le spectre' : 'Révéler la solution'}
                        <Sparkles className="h-5 w-5" />
                    </motion.button>
                )}
            </motion.div>

            {/* Effets de fond animés */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`absolute rounded-full ${
                            spookyMode ? 'bg-purple-500/10' : 'bg-yellow-400/10'
                        }`}
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            scale: 0,
                            opacity: 0
                        }}
                        animate={{
                            scale: [0, Math.random() * 0.5 + 0.5, 0],
                            opacity: [0, 0.3, 0],
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                        }}
                        transition={{
                            duration: Math.random() * 15 + 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            width: `${Math.random() * 200 + 100}px`,
                            height: `${Math.random() * 200 + 100}px`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};