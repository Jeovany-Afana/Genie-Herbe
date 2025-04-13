// src/components/IdentificationQuestion.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    Lock,
    Sparkles,
    Telescope,
    Fingerprint,
    Zap,
    Ghost
} from 'lucide-react';
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
    // Nouvelle prop qui permettra de notifier la fin de la question d’identification
    onFinish?: () => void;
}

export const IdentificationQuestion: React.FC<IdentificationQuestionProps> = ({ question, teams, onFinish }) => {
    const [revealedClues, setRevealedClues] = useState<number[]>([]);
    const [showSolution, setShowSolution] = useState(false);
    const [userGuess, setUserGuess] = useState('');
    const [hasGuessed, setHasGuessed] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [revealingClue, setRevealingClue] = useState<number | null>(null);
    const [spookyMode, setSpookyMode] = useState(false);
    const [introStep, setIntroStep] = useState(0);

    // Séquence d'intro spectaculaire en plein écran
    useEffect(() => {
        setSpookyMode(Math.random() < 0.2);

        // Séquence d'intro en 4 étapes
        const introTimers = [
            setTimeout(() => setIntroStep(1), 2000), // Titre
            setTimeout(() => setIntroStep(2), 4000), // Équipes
            setTimeout(() => setIntroStep(3), 7000), // Message
            setTimeout(() => {
                setShowIntro(false);
                if (question.clues?.length) {
                    setTimeout(() => handleRevealClue(0), 1000);
                }
            }, 10000) // Fin de l'intro
        ];

        return () => introTimers.forEach(timer => clearTimeout(timer));
    }, [question.clues]);

    const handleRevealClue = async (index: number) => {
        if (revealedClues.includes(index)) return;
        setRevealingClue(index);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Durée d'attente avant révélation

        confetti({
            particleCount: 100,
            angle: 270,
            spread: 50,
            origin: { x: 0.5, y: 0 },
            colors: spookyMode
                ? ['#8b5cf6', '#ec4899', '#d946ef']
                : ['#f59e0b', '#3b82f6', '#10b981'],
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
            colors: spookyMode
                ? ['#8b5cf6', '#ec4899']
                : ['#10b981', '#84cc16', '#f59e0b'],
            shapes: ['circle', 'star'],
            scalar: 1.8
        });
    };

    const handleSubmitGuess = () => {
        setHasGuessed(true);
        if (userGuess.toLowerCase() === question.solution?.toLowerCase()) {
            confetti({
                particleCount: 600,
                spread: 150,
                origin: { y: 0.6 },
                colors: spookyMode
                    ? ['#8b5cf6', '#ec4899', '#a855f7']
                    : ['#10b981', '#84cc16', '#f59e0b'],
                shapes: ['circle', 'star'],
                scalar: 2.5
            });
        }
        // Après avoir soumis la réponse, appeler onFinish après un délai
        setTimeout(() => {
            if (onFinish) {
                onFinish();
            }
        }, 3000); // délai de 3 secondes (ajustez si besoin)
    };

    // Couleurs et styles dynamiques
    const primaryColor = spookyMode ? '#8b5cf6' : '#f59e0b';
    const secondaryColor = spookyMode ? '#ec4899' : '#3b82f6';
    const bgColor = spookyMode ? 'bg-gray-900' : 'bg-gray-800';
    const textColor = spookyMode ? 'text-purple-400' : 'text-yellow-400';

    return (
        <div className={`relative overflow-hidden min-h-screen ${bgColor} text-white`}>
            {/* Animation d'intro spectaculaire en plein écran */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 z-50"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                    >
                        {/* Fond animé plein écran */}
                        <div className="absolute inset-0 overflow-hidden">
                            {[...Array(30)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className={`absolute rounded-full ${spookyMode ? 'bg-purple-500/10' : 'bg-yellow-400/10'}`}
                                    initial={{
                                        x: Math.random() * window.innerWidth,
                                        y: Math.random() * window.innerHeight,
                                        scale: 0,
                                        opacity: 0
                                    }}
                                    animate={{
                                        scale: [0, Math.random() * 2 + 1, 0],
                                        opacity: [0, 0.4, 0],
                                        x: Math.random() * window.innerWidth,
                                        y: Math.random() * window.innerHeight
                                    }}
                                    transition={{
                                        duration: Math.random() * 20 + 10,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    style={{
                                        width: `${Math.random() * 300 + 100}px`,
                                        height: `${Math.random() * 300 + 100}px`
                                    }}
                                />
                            ))}
                        </div>

                        <motion.div className="relative z-10 text-center space-y-12 p-8 max-w-4xl mx-auto">
                            {/* Étape 1 : Affichage du titre */}
                            {introStep >= 1 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1.5 }}
                                >
                                    <motion.h1
                                        animate={{
                                            textShadow: [
                                                `0 0 20px ${primaryColor}`,
                                                `0 0 40px ${secondaryColor}`,
                                                `0 0 60px ${primaryColor}`
                                            ],
                                            y: [0, -20, 0]
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                                        className="text-8xl font-bold mb-6"
                                        style={{ color: primaryColor }}
                                    >
                                        {spookyMode ? 'MYSTÈRE' : 'IDENTIFICATION'}
                                    </motion.h1>
                                </motion.div>
                            )}

                            {/* Étape 2 : Affichage des équipes */}
                            {introStep >= 2 && (
                                <motion.div
                                    className="flex flex-col items-center space-y-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1 }}
                                >
                                    <motion.div
                                        initial={{ x: -200, opacity: 0 }}
                                        animate={{
                                            x: 0,
                                            opacity: 1,
                                            transition: { type: 'spring', stiffness: 200 }
                                        }}
                                        className="text-5xl font-bold"
                                        style={{ color: teams?.[0]?.color || primaryColor }}
                                    >
                                        ÉQUIPE A : {teams?.[0]?.name || 'Equipe A'}
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scaleX: 0 }}
                                        animate={{
                                            opacity: 1,
                                            scaleX: 1,
                                            transition: { duration: 1 }
                                        }}
                                        className="w-96 h-2 bg-white/50 rounded-full"
                                    />
                                    <motion.div
                                        initial={{ x: 200, opacity: 0 }}
                                        animate={{
                                            x: 0,
                                            opacity: 1,
                                            transition: { type: 'spring', stiffness: 200 }
                                        }}
                                        className="text-5xl font-bold"
                                        style={{ color: teams?.[1]?.color || secondaryColor }}
                                    >
                                        ÉQUIPE B : {teams?.[1]?.name || 'Equipe B'}
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* Étape 3 : Message d'introduction */}
                            {introStep >= 3 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0, transition: { duration: 1.5 } }}
                                    className="pt-12"
                                >
                                    <motion.p className="text-4xl text-white/90 mb-8">
                                        {spookyMode ? 'Un défi spectral vous attend...' : 'Préparez-vous pour le défi !'}
                                    </motion.p>
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 2 } }}
                                        className="text-6xl"
                                    >
                                        {spookyMode ? '👻' : '🕵️‍♂️'}
                                    </motion.div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Effets spéciaux en fond pour l'intro */}
                        {spookyMode
                            ? [...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="fixed text-4xl text-purple-400 pointer-events-none"
                                    initial={{
                                        x: Math.random() * window.innerWidth,
                                        y: Math.random() * window.innerHeight,
                                        opacity: 0,
                                        scale: 0
                                    }}
                                    animate={{
                                        x: Math.random() * window.innerWidth,
                                        y: Math.random() * window.innerHeight,
                                        opacity: [0, 0.8, 0],
                                        scale: [0, 1.5, 0],
                                        rotate: 360
                                    }}
                                    transition={{
                                        duration: Math.random() * 6 + 4,
                                        repeat: Infinity,
                                        delay: Math.random() * 3
                                    }}
                                >
                                    {['👻', '💀', '🕷️', '🕸️', '🧛'][i % 5]}
                                </motion.div>
                            ))
                            : [...Array(40)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="fixed text-3xl text-yellow-400 pointer-events-none"
                                    initial={{
                                        x: Math.random() * window.innerWidth,
                                        y: Math.random() * window.innerHeight,
                                        scale: 0,
                                        opacity: 0
                                    }}
                                    animate={{
                                        x: Math.random() * window.innerWidth,
                                        y: Math.random() * window.innerHeight,
                                        scale: [0, 1.5, 0],
                                        opacity: [0, 1, 0],
                                        rotate: 360
                                    }}
                                    transition={{
                                        duration: Math.random() * 4 + 3,
                                        repeat: Infinity,
                                        delay: Math.random() * 2
                                    }}
                                >
                                    {['✨', '⚡', '🔍', '🕵️', '🔎'][i % 5]}
                                </motion.div>
                            ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contenu principal */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: showIntro ? 10 : 0, duration: 1 }}
                className="space-y-8 p-8 max-w-6xl mx-auto"
            >
                {/* En-tête */}
                <motion.div
                    initial={{ y: -50 }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 5,
                            ease: "easeInOut"
                        }}
                        className="text-6xl mb-6"
                    >
                        {spookyMode ? '👻' : '🕵️‍♂️'}
                    </motion.div>
                    <h2
                        className="text-4xl font-bold mb-4"
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
                            transition={{ delay: 1 }}
                            className="text-xl italic text-white/80"
                        >
                            {question.hint}
                        </motion.p>
                    )}
                </motion.div>

                {/* Indices */}
                <div className="space-y-6">
                    <h3 className={`text-2xl font-semibold flex items-center gap-3 ${textColor}`}>
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        >
                            {spookyMode ? <Zap className="h-8 w-8" /> : <Fingerprint className="h-8 w-8" />}
                        </motion.div>
                        Indices à découvrir
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                        {question.clues?.map((clue, index) => (
                            <motion.div
                                key={index}
                                layout
                                initial={{ opacity: 0, y: 50 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        delay: index * 0.2 + 1,
                                        type: 'spring',
                                        stiffness: 300
                                    }
                                }}
                                whileHover={{ scale: 1.03 }}
                                onClick={() => handleRevealClue(index)}
                                className={`p-6 rounded-xl cursor-pointer transition-all relative overflow-hidden border-2 ${
                                    revealedClues.includes(index)
                                        ? spookyMode
                                            ? 'border-purple-500 bg-purple-900/30'
                                            : 'border-yellow-400 bg-yellow-900/30'
                                        : 'border-gray-700 bg-gray-800 hover:border-yellow-400/50'
                                }`}
                            >
                                <AnimatePresence>
                                    {revealingClue === index && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 15, opacity: 0, transition: { duration: 1.2 } }}
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: spookyMode
                                                    ? 'radial-gradient(circle, rgba(139,92,246,0.8) 0%, rgba(139,92,246,0) 70%)'
                                                    : 'radial-gradient(circle, rgba(245,158,11,0.8) 0%, rgba(245,158,11,0) 70%)'
                                            }}
                                        />
                                    )}
                                </AnimatePresence>
                                <div className="flex items-center gap-5">
                                    <motion.div
                                        className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0 ${
                                            revealedClues.includes(index)
                                                ? spookyMode
                                                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                                    : 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-blue-900'
                                                : 'bg-gray-700 text-gray-400'
                                        }`}
                                        animate={{
                                            rotate: revealedClues.includes(index) ? 360 : 0,
                                            scale: revealingClue === index ? [1, 1.3, 1] : 1
                                        }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    >
                                        {revealedClues.includes(index) ? (
                                            <Check className="h-7 w-7" />
                                        ) : (
                                            <Lock className="h-6 w-6" />
                                        )}
                                    </motion.div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                      <span className={`text-xl font-medium ${revealedClues.includes(index) ? textColor : 'text-gray-400'}`}>
                        Indice {index + 1} - {clue.points} pts
                      </span>
                                            {revealedClues.includes(index) && (
                                                <motion.span
                                                    animate={{ scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] }}
                                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                                    className="text-3xl"
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
                                                    animate={{ opacity: 1, height: 'auto', transition: { delay: 0.5, duration: 0.8 } }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3"
                                                >
                                                    <motion.p
                                                        className="text-white text-xl"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1, transition: { delay: 1, duration: 1 } }}
                                                    >
                                                        {clue.text}
                                                    </motion.p>
                                                </motion.div>
                                            ) : (
                                                <motion.p
                                                    className="text-gray-400 italic mt-3"
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
                    transition={{ delay: 1.5 }}
                    className="space-y-6"
                >
                    <h3 className={`text-2xl font-semibold flex items-center gap-3 ${textColor}`}>
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        >
                            {spookyMode ? <Zap className="h-8 w-8" /> : <Fingerprint className="h-8 w-8" />}
                        </motion.div>
                        Votre hypothèse
                    </h3>
                    <div className="flex gap-4">
                        <motion.div className="flex-1 relative" whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <input
                                type="text"
                                value={userGuess}
                                onChange={(e) => setUserGuess(e.target.value)}
                                placeholder={spookyMode ? "Quel est ce spectre ?" : "Qui ou quoi suis-je ?"}
                                className={`w-full px-6 py-4 bg-gray-700 border-2 rounded-xl text-white placeholder-gray-400 outline-none text-xl ${
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
                                    animate={{ opacity: [0.3, 0.8, 0.3], x: [0, 8, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl"
                                >
                                    ?
                                </motion.div>
                            )}
                        </motion.div>
                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow: spookyMode
                                    ? '0 0 25px rgba(139, 92, 246, 0.7)'
                                    : '0 0 25px rgba(16, 185, 129, 0.6)'
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmitGuess}
                            disabled={!userGuess.trim() || hasGuessed}
                            className={`px-8 py-4 rounded-xl font-bold disabled:opacity-50 flex items-center gap-3 text-xl ${
                                spookyMode
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900'
                            }`}
                        >
                            <motion.span animate={{ scale: [1, 1.3, 1], transition: { repeat: Infinity, duration: 3 } }}>
                                {spookyMode ? '👁️' : '🔍'}
                            </motion.span>
                            Valider
                        </motion.button>
                    </div>
                    {hasGuessed && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, duration: 1.5 } }}
                            className={`p-5 rounded-xl text-center font-bold text-xl ${
                                userGuess.toLowerCase() === question.solution?.toLowerCase()
                                    ? 'bg-green-900/40 border-2 border-green-500 text-green-400'
                                    : 'bg-red-900/40 border-2 border-red-500 text-red-400'
                            }`}
                        >
                            {userGuess.toLowerCase() === question.solution?.toLowerCase() ? (
                                <div className="flex items-center justify-center gap-3">
                                    <motion.div
                                        animate={{ scale: [1, 1.6, 1], rotate: [0, 360] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        className="text-4xl"
                                    >
                                        {spookyMode ? '👏' : '🎯'}
                                    </motion.div>
                                    <span>{spookyMode ? 'Exorcisme réussi !' : 'Brillante déduction !'}</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="text-4xl"
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
                            initial={{ opacity: 0, y: 100 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                transition: { delay: 0.5, type: 'spring', stiffness: 200, damping: 15, duration: 2 }
                            }}
                            exit={{
                                opacity: 0,
                                y: 100,
                                transition: { duration: 1.5, delay: 10 }
                            }}
                            className={`p-8 rounded-xl border-2 mt-8 text-center ${
                                spookyMode ? 'bg-purple-900/30 border-purple-500' : 'bg-yellow-900/30 border-yellow-500'
                            }`}
                        >
                            <div className="flex flex-col items-center">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        y: [0, -10, 0],
                                        transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                                    }}
                                    className="text-6xl mb-6"
                                >
                                    {spookyMode ? '🏆' : '🎉'}
                                </motion.div>
                                <h4 className={`text-3xl font-bold mb-4 ${spookyMode ? 'text-purple-400' : 'text-yellow-400'}`}>
                                    {spookyMode ? 'Le mystère est élucidé' : 'Solution révélée'}
                                </h4>
                                <motion.p
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1, transition: { type: 'spring', stiffness: 300, duration: 1.5 } }}
                                    className="text-4xl font-bold mb-8 text-white"
                                >
                                    {question.solution}
                                </motion.p>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="text-5xl"
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
                            scale: 1.05,
                            boxShadow: spookyMode
                                ? '0 0 25px rgba(139, 92, 246, 0.7)'
                                : '0 0 25px rgba(16, 185, 129, 0.6)'
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleShowSolution}
                        className={`w-full py-4 rounded-xl font-bold mt-8 flex items-center justify-center gap-3 text-xl ${
                            spookyMode
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900'
                        }`}
                    >
                        <Sparkles className="h-6 w-6" />
                        {spookyMode ? 'Révéler le spectre' : 'Révéler la solution'}
                        <Sparkles className="h-6 w-6" />
                    </motion.button>
                )}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onFinish?.()}  // onFinish est facultatif, on utilise le ?
                    className="px-6 py-3 bg-red-500 text-white rounded-xl"
                >
                    Ignorer
                </motion.button>

            </motion.div>
        </div>
    );
};

export default IdentificationQuestion;
