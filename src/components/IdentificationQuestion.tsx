// src/components/IdentificationQuestion.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, Star, Award, Sparkles, Lock, LockOpen } from 'lucide-react';
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
    const [isCelebrating, setIsCelebrating] = useState(false);
    const [userGuess, setUserGuess] = useState('');
    const [hasGuessed, setHasGuessed] = useState(false);

    // Effet pour le premier indice révélé automatiquement
    useEffect(() => {
        if (question.clues && question.clues.length > 0 && revealedClues.length === 0) {
            setTimeout(() => {
                handleRevealClue(0);
            }, 1000);
        }
    }, []);

    const handleRevealClue = (index: number) => {
        if (!revealedClues.includes(index)) {
            // Animation de révélation
            setIsCelebrating(true);

            // Confetti spécifique à l'indice
            const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];
            confetti({
                particleCount: 40 + (index * 20),
                spread: 50 + (index * 10),
                origin: { y: 0.6 },
                colors: [colors[index % colors.length]],
                scalar: 0.8 + (index * 0.1)
            });

            setRevealedClues([...revealedClues, index]);

            setTimeout(() => setIsCelebrating(false), 1000);
        }
    };

    const handleShowSolution = () => {
        setShowSolution(true);

        // Grande animation pour la solution
        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#10b981', '#84cc16', '#ecfccb'],
            shapes: ['circle', 'star'],
            scalar: 1.2
        });
    };

    const handleSubmitGuess = () => {
        setHasGuessed(true);
        if (userGuess.toLowerCase() === question.solution?.toLowerCase()) {
            // Bonne réponse - grande célébration
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#10b981', '#84cc16'],
                shapes: ['circle', 'star'],
                scalar: 1.5
            });
        }
    };

    // Animation variants
    const clueItem = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                delay: i * 0.1,
                type: 'spring',
                stiffness: 100
            }
        }),
        hover: {
            scale: 1.03,
            boxShadow: '0 5px 15px rgba(245, 158, 11, 0.3)'
        },
        tap: { scale: 0.98 }
    };

    const clueIcon = {
        hidden: { rotate: -90, scale: 0 },
        visible: {
            rotate: 0,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 200,
                damping: 10
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            {/* En-tête mystérieux */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-effect-inner p-6 rounded-xl border-2 border-purple-500/30 text-center"
            >
                <motion.div
                    animate={{
                        rotate: [0, 5, -5, 0],
                        y: [0, -5, 0]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut"
                    }}
                    className="text-4xl mb-3"
                >
                    🔍
                </motion.div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-yellow-400">
                    Qui suis-je ?
                </h3>
                <p className="text-white/80 mt-2 italic">{question.text}</p>
            </motion.div>

            {/* Indices - Liste mystérieuse */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
                    <LockOpen className="h-5 w-5" />
                    Indices révélés ({revealedClues.length}/{question.clues?.length || 0})
                </h4>

                <div className="grid grid-cols-1 gap-3">
                    {question.clues?.map((clue, index) => (
                        <motion.div
                            key={index}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            whileTap="tap"
                            variants={clueItem}
                            onClick={() => handleRevealClue(index)}
                            className={`p-4 rounded-xl cursor-pointer transition-all
                                ${revealedClues.includes(index)
                                ? 'bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 border-2 border-yellow-400/50'
                                : 'bg-gray-800/50 border-2 border-gray-700 hover:border-yellow-400/30'}`}
                        >
                            <div className="flex items-center gap-4">
                                <motion.div
                                    variants={clueIcon}
                                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0
                                        ${revealedClues.includes(index)
                                        ? 'bg-yellow-400 text-blue-900'
                                        : 'bg-gray-700 text-gray-400'}`}
                                >
                                    {revealedClues.includes(index) ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <Lock className="h-4 w-4" />
                                    )}
                                </motion.div>

                                <div className="flex-1 text-left">
                                    <div className="flex justify-between items-center">
                                        <span className={`font-bold ${revealedClues.includes(index) ? 'text-yellow-400' : 'text-gray-400'}`}>
                                            Indice {index + 1} - {clue.points}pts
                                        </span>
                                        {revealedClues.includes(index) && (
                                            <motion.span
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    rotate: [0, 10, -10, 0]
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 2,
                                                    ease: "easeInOut"
                                                }}
                                                className="text-lg"
                                            >
                                                {index === 0 ? '🔦' : index === 1 ? '🔍' : '💡'}
                                            </motion.span>
                                        )}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {revealedClues.includes(index) ? (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="text-white mt-1"
                                            >
                                                {clue.text}
                                            </motion.p>
                                        ) : (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="text-gray-400 italic mt-1"
                                            >
                                                Indice verrouillé
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Zone de devinette */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
            >
                <h4 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Votre réponse
                </h4>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={userGuess}
                        onChange={(e) => setUserGuess(e.target.value)}
                        placeholder="Qui ou quoi suis-je ?"
                        className="flex-1 px-4 py-3 bg-gray-800/50 border-2 border-yellow-400/30 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400 outline-none"
                        disabled={hasGuessed}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmitGuess}
                        disabled={!userGuess.trim() || hasGuessed}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-xl font-bold disabled:opacity-50"
                    >
                        Valider
                    </motion.button>
                </div>

                {hasGuessed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-xl text-center font-bold text-lg ${
                            userGuess.toLowerCase() === question.solution?.toLowerCase()
                                ? 'bg-green-500/20 text-green-400 border-2 border-green-400/50'
                                : 'bg-red-500/20 text-red-400 border-2 border-red-400/50'
                        }`}
                    >
                        {userGuess.toLowerCase() === question.solution?.toLowerCase()
                            ? '✅ Exact ! Bravo !'
                            : '❌ Presque... Essayez encore !'}
                    </motion.div>
                )}
            </motion.div>

            {/* Solution (révélée automatiquement après tous les indices ou manuellement) */}
            {(revealedClues.length === question.clues?.length || showSolution) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-effect-inner p-6 rounded-xl border-2 border-green-400/30 mt-6"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Award className="h-8 w-8 text-green-400" />
                        <h4 className="text-xl font-bold text-green-400">Solution</h4>
                        <Award className="h-8 w-8 text-green-400" />
                    </div>

                    <motion.p
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="text-2xl font-bold text-center text-white mb-4"
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
                        className="text-4xl text-center"
                    >
                        🎉
                    </motion.div>
                </motion.div>
            )}

            {/* Bouton pour révéler la solution manuellement */}
            {!showSolution && revealedClues.length < (question.clues?.length || 0) && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShowSolution}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold text-lg mt-4"
                >
                    Révéler la solution
                </motion.button>
            )}

            {/* Effets de célébration en arrière-plan */}
            <AnimatePresence>
                {isCelebrating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none flex items-center justify-center"
                    >
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-2xl"
                                initial={{
                                    x: 0,
                                    y: 0,
                                    scale: 1,
                                    opacity: 1
                                }}
                                animate={{
                                    x: Math.random() * 400 - 200,
                                    y: Math.random() * -300 - 100,
                                    scale: 0,
                                    opacity: 0,
                                    rotate: Math.random() * 360
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.05,
                                    ease: "easeOut"
                                }}
                            >
                                {['✨', '🌟', '⚡', '💎', '🔥'][Math.floor(Math.random() * 5)]}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};