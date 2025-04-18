// src/components/IdentificationQuestion.tsx
import React, { useState, useEffect } from 'react';
import useSound from 'use-sound';
import introSound1 from '/sounds/intro1.mp3';
import introSound2 from '/sounds/intro2.mp3';
import clueRevealSound from '/sounds/clue-reveal.mp3';
import letTheGame from '/sounds/let-the-game.mp3';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    Lock,
    Sparkles,
    Fingerprint,
    Zap
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

// === UTILS ===
// Fonction utilitaire pour convertir une couleur hexadécimale en RGBA avec une transparence donnée.
function hexToRgba(hex: string, alpha: number): string {
    // Retirer le "#" si présent
    const normalizedHex = hex.replace('#', '');
    const bigint = parseInt(normalizedHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

// ============== THÈMES ============== //
const identificationTheme = {
    name: "IDENTIFICATION",
    icon: "🕵️",
    color: "#f59e0b",
    secondaryColor: "#3b82f6",
    bgColor: "bg-gray-800",
    textColor: "text-yellow-400",
    messages: {
        intro: "DÉFI D'IDENTIFICATION !",
        challenge: "Saurez-vous reconnaître le sujet ?",
        success: "Identification réussie !",
        failure: "Essaie encore !"
    },
    emojis: ["🔍", "🧩", "🔎", "📋", "🖋️"],
    // Nouvelles propriétés
    arrowIcon: "👉",
    indiceIcon: "🔍",
    responseIcon: undefined, // Laissez undefined pour utiliser la valeur par défaut dans le composant
    inputPlaceholder: "Votre hypothèse...",
    inputBorderClass: "border-yellow-400 focus:border-yellow-500",
    hoverShadowColor: "rgba(245,158,11,0.6)",
    submitButtonClass: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900",
    guessIcon: "🔍",
    successIcon: "🎯",
    failureIcon: "❌",
    solutionBgClass: "bg-yellow-900/30",
    solutionBorderClass: "border-yellow-500",
    solutionIcon: "🎉",
    solutionIconAlt: "🎊",
    revealButtonClass: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900",
    revealButtonText: "Révéler la solution",
    emptyClueMessage: "RESOLVEZ L'ENIGME",
};

const spookyTheme = {
    name: "MYSTÈRE",
    icon: "👻",
    color: "#8b5cf6",
    secondaryColor: "#ec4899",
    bgColor: "bg-gray-900",
    textColor: "text-purple-400",
    messages: {
        intro: "UN MYSTÈRE VOUS ATTEND...",
        challenge: "Osez-vous découvrir la vérité ?",
        success: "Exorcisme réussi !",
        failure: "Le spectre résiste..."
    },
    emojis: ["👻", "💀", "🕷️", "🕸️", "🧛"],
    arrowIcon: "👉",
    indiceIcon: "👻",
    responseIcon: undefined,
    inputPlaceholder: "Quel est ce spectre ?",
    inputBorderClass: "border-purple-500 focus:border-pink-500",
    hoverShadowColor: "rgba(139,92,246,0.7)",
    submitButtonClass: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
    guessIcon: "👁️",
    successIcon: "👏",
    failureIcon: "👻",
    solutionBgClass: "bg-purple-900/30",
    solutionBorderClass: "border-purple-500",
    solutionIcon: "🏆",
    solutionIconAlt: "👏",
    revealButtonClass: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
    revealButtonText: "Révéler le spectre",
    emptyClueMessage: "RESOLVEZ LE MYSTÈRE",
};

const detectiveTheme = {
    name: "ENQUÊTE CRIMINELLE",
    icon: "🕵️‍♂️",
    color: "#000000",
    secondaryColor: "#ef4444",
    bgColor: "bg-gray-900",
    textColor: "text-gray-200",
    messages: {
        intro: "MYSTÈRE NON RÉSOLU !",
        challenge: "Qui est le coupable ?",
        success: "Cas résolu, Sherlock !",
        failure: "Le coupable s'est échappé..."
    },
    emojis: ["🔍", "🕵️", "👣", "💼", "🔦"],
    arrowIcon: "👉",
    indiceIcon: "🔍",
    responseIcon: undefined,
    inputPlaceholder: "Votre hypothèse...",
    inputBorderClass: "border-gray-500 focus:border-gray-400",
    hoverShadowColor: "rgba(0,0,0,0.6)",
    submitButtonClass: "bg-gradient-to-r from-gray-500 to-gray-400 text-white",
    guessIcon: "🔍",
    successIcon: "🎯",
    failureIcon: "❌",
    solutionBgClass: "bg-gray-900/30",
    solutionBorderClass: "border-gray-500",
    solutionIcon: "🎉",
    solutionIconAlt: "🎊",
    revealButtonClass: "bg-gradient-to-r from-gray-500 to-gray-400 text-white",
    revealButtonText: "Révéler la solution",
    emptyClueMessage: "TROUVEZ LE COUPLABLE",
};

const timeTravelTheme = {
    name: "VOYAGE TEMPOREL",
    icon: "⏳",
    color: "#10b981",
    secondaryColor: "#3b82f6",
    bgColor: "bg-emerald-900",
    textColor: "text-emerald-400",
    messages: {
        intro: "ATTENTION : PARADOXE TEMPOREL !",
        challenge: "De quelle époque s'agit-il ?",
        success: "Retour vers le futur réussi !",
        failure: "Vous avez créé un paradoxe !"
    },
    emojis: ["🕰️", "⏱️", "🌌", "🚀", "👴"],
    arrowIcon: "👉",
    indiceIcon: "🕰️",
    responseIcon: undefined,
    inputPlaceholder: "Votre hypothèse...",
    inputBorderClass: "border-emerald-500 focus:border-emerald-400",
    hoverShadowColor: "rgba(16,185,129,0.6)",
    submitButtonClass: "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white",
    guessIcon: "🔍",
    successIcon: "🎯",
    failureIcon: "❌",
    solutionBgClass: "bg-emerald-900/30",
    solutionBorderClass: "border-emerald-500",
    solutionIcon: "🎉",
    solutionIconAlt: "🎊",
    revealButtonClass: "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white",
    revealButtonText: "Révéler la solution",
    emptyClueMessage: "RÉSOLVEZ LE PARADOXE",
};

const spaceTheme = {
    name: "MISSION SPATIALE",
    icon: "🚀",
    color: "#3b82f6",
    secondaryColor: "#8b5cf6",
    bgColor: "bg-gray-900",
    textColor: "text-blue-400",
    messages: {
        intro: "ALERTE CODE ROUGE !",
        challenge: "Pouvez-vous résoudre le mystère interstellaire ?",
        success: "Mission accomplie Commandant !",
        failure: "Échec de la mission..."
    },
    emojis: ["👽", "🛸", "🌌", "🪐", "👾"],
    arrowIcon: "👉",
    indiceIcon: "👽",
    responseIcon: undefined,
    inputPlaceholder: "Votre hypothèse...",
    inputBorderClass: "border-blue-400 focus:border-blue-500",
    hoverShadowColor: "rgba(59,130,246,0.6)",
    submitButtonClass: "bg-gradient-to-r from-blue-400 to-blue-500 text-white",
    guessIcon: "🔍",
    successIcon: "🎯",
    failureIcon: "❌",
    solutionBgClass: "bg-blue-900/30",
    solutionBorderClass: "border-blue-400",
    solutionIcon: "🎉",
    solutionIconAlt: "🎊",
    revealButtonClass: "bg-gradient-to-r from-blue-400 to-blue-500 text-white",
    revealButtonText: "Révéler la solution",
    emptyClueMessage: "RÉSOLVEZ LE MYSTÈRE INTERSTELLAIRE"
};

const pirateTheme = {
    name: "TRÉSOR PIRATE",
    icon: "🏴‍☠️",
    color: "#f59e0b",
    secondaryColor: "#dc2626",
    bgColor: "bg-amber-900",
    textColor: "text-yellow-400",
    messages: {
        intro: "CHASSE AU TRÉSOR !",
        challenge: "Où est caché le butin ?",
        success: "Trésor trouvé ! 🎉",
        failure: "Le trésor reste caché..."
    },
    emojis: ["🏴‍☠️", "⚓", "🗺️", "💎", "🔱"],
    arrowIcon: "👉",
    indiceIcon: "🏴‍☠️",
    responseIcon: undefined,
    inputPlaceholder: "Votre hypothèse...",
    inputBorderClass: "border-amber-500 focus:border-amber-400",
    hoverShadowColor: "rgba(245,158,11,0.6)",
    submitButtonClass: "bg-gradient-to-r from-amber-400 to-amber-500 text-white",
    guessIcon: "🔍",
    successIcon: "🎯",
    failureIcon: "❌",
    solutionBgClass: "bg-amber-900/30",
    solutionBorderClass: "border-amber-500",
    solutionIcon: "🎉",
    solutionIconAlt: "🎊",
    revealButtonClass: "bg-gradient-to-r from-amber-400 to-amber-500 text-white",
    revealButtonText: "Révéler la solution",
    emptyClueMessage: "TROUVEZ LE BUTIN",
};

const superheroTheme = {
    name: "MISSION HÉROS",
    icon: "🦸",
    color: "#dc2626",
    secondaryColor: "#3b82f6",
    bgColor: "bg-red-900",
    textColor: "text-red-400",
    messages: {
        intro: "APPEL À TOUS LES HÉROS !",
        challenge: "Pouvez-vous sauver la journée ?",
        success: "La ville est sauvée !",
        failure: "Le vilain a gagné cette fois..."
    },
    emojis: ["🦸", "💥", "👊", "🦹", "🌆"],
    arrowIcon: "👉",
    indiceIcon: "🦸",
    responseIcon: undefined,
    inputPlaceholder: "Votre hypothèse...",
    inputBorderClass: "border-red-500 focus:border-red-400",
    hoverShadowColor: "rgba(220,38,38,0.6)",
    submitButtonClass: "bg-gradient-to-r from-red-400 to-red-500 text-white",
    guessIcon: "🔍",
    successIcon: "🎯",
    failureIcon: "❌",
    solutionBgClass: "bg-red-900/30",
    solutionBorderClass: "border-red-500",
    solutionIcon: "🎉",
    solutionIconAlt: "🎊",
    revealButtonClass: "bg-gradient-to-r from-red-400 to-red-500 text-white",
    revealButtonText: "Révéler la solution",
    emptyClueMessage: "SOUVENEZ-VOUS, HÉROS",
};

const wizardTheme = {
    name: "CONFRONTATION DES SORCIERS",
    icon: "🧙",
    color: "#8b5cf6",
    secondaryColor: "#10b981",
    bgColor: "bg-purple-900",
    textColor: "text-purple-400",
    messages: {
        intro: "LE SORTILÈGE COMMENCE...",
        challenge: "Quel est ce sort mystérieux ?",
        success: "Sort réussi ! ✨",
        failure: "Le sort s'est retourné contre vous..."
    },
    emojis: ["⚡", "✨", "🔮", "🧪", "🐉"],
    arrowIcon: "👉",
    indiceIcon: "🧙",
    responseIcon: undefined,
    inputPlaceholder: "Votre hypothèse...",
    inputBorderClass: "border-purple-500 focus:border-purple-400",
    hoverShadowColor: "rgba(139,92,246,0.6)",
    submitButtonClass: "bg-gradient-to-r from-purple-600 to-purple-700 text-white",
    guessIcon: "🔍",
    successIcon: "🎯",
    failureIcon: "❌",
    solutionBgClass: "bg-purple-900/30",
    solutionBorderClass: "border-purple-500",
    solutionIcon: "🎉",
    solutionIconAlt: "🎊",
    revealButtonClass: "bg-gradient-to-r from-purple-600 to-purple-700 text-white",
    revealButtonText: "Révéler la solution",
    emptyClueMessage: "RETROUVEZ-VOUS, SORCIERS",
};

const allThemes = [
    identificationTheme,
    spookyTheme,
    detectiveTheme,
    timeTravelTheme,
    spaceTheme,
    pirateTheme,
    superheroTheme,
    wizardTheme,
];

// Composant LightningStrike (pour l'effet visuel)
const LightningStrike: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
    const paths = [
        "M100,0 L120,50 L110,60 L130,90 L115,95 L140,150",
        "M200,0 L180,30 L190,40 L170,70 L185,75 L160,120",
        "M300,0 L320,40 L310,50 L330,80 L315,85 L340,140"
    ];

    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: active ? 0.7 : 0, transition: 'opacity 0.2s' }}
        >
            {paths.map((path, i) => (
                <motion.path
                    key={i}
                    d={path}
                    stroke={color}
                    strokeWidth="2"
                    fill="none"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        pathLength: [0, 1, 0],
                        transition: { duration: 0.5, delay: i * 0.1 }
                    }}
                />
            ))}
        </svg>
    );
};

export const IdentificationQuestion: React.FC<IdentificationQuestionProps> = ({ question, teams, onFinish }) => {
    const [revealedClues, setRevealedClues] = useState<number[]>([]);
    const [showSolution, setShowSolution] = useState(false);
    const [userGuess, setUserGuess] = useState('');
    const [hasGuessed, setHasGuessed] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [revealingClue, setRevealingClue] = useState<number | null>(null);
    const [introStep, setIntroStep] = useState(0);
    const [currentTheme, setCurrentTheme] = useState(allThemes[0]);

    // Note : ici revealedClasses est défini par l'utilisateur. Vous pouvez le modifier selon vos besoins.
    const revealedClasses = `border-[custom-color-based-on-currentTheme] bg-[custom-bg-based-on-currentTheme]`;

    // Effets sonores
    const playIntro1 = new Audio(introSound1);
    const playIntro2 = new Audio(introSound2);
    const playLetBegin = new Audio(letTheGame);
    const [playClueReveal] = useSound(clueRevealSound);

    // Séquence d'intro avec useEffect
    useEffect(() => {
        const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)];
        setCurrentTheme(randomTheme);

        const introTimers = [
            setTimeout(() => {
                setIntroStep(1); // Titre
                playIntro1.play();
                triggerThunder(500, 1000);
                if (Math.random() > 0.5) {
                    setTimeout(() => {
                        setThunderEffect(true);
                        setTimeout(() => setThunderEffect(false), 300);
                    }, Math.random() * 1000 + 500);
                }
            }, 1500),
            setTimeout(() => {
                setIntroStep(2); // Équipe
                setTimeout(() => {
                    setThunderEffect(true);
                    setTimeout(() => setThunderEffect(false), 300);
                }, 800);
            }, 3500),
            setTimeout(() => {
                setIntroStep(3); // Message mystère
                playIntro2.play();
                playLetBegin.play();
                triggerThunder(1000, 200, true);
                setTimeout(() => {
                    setThunderEffect(true);
                    setTimeout(() => {
                        setThunderEffect(false);
                        setTimeout(() => {
                            setThunderEffect(true);
                            setTimeout(() => setThunderEffect(false), 200);
                        }, 300);
                    }, 200);
                }, 1000);
            }, 6000),
            setTimeout(() => {
                setIntroStep(4); // Appel à l'action
                triggerThunder(500, 400);
                setTimeout(() => {
                    setThunderEffect(true);
                    setTimeout(() => setThunderEffect(false), 400);
                }, 500);
            }, 9000),
            setTimeout(() => {
                setShowIntro(false);
            }, 12000)
        ];

        return () => introTimers.forEach(timer => clearTimeout(timer));
    }, [question.clues]);

    // Fonction pour déclencher les éclairs
    const triggerThunder = (delay: number, duration: number, double: boolean = false) => {
        setTimeout(() => {
            setThunderEffect(true);
            setTimeout(() => {
                setThunderEffect(false);
                if (double) {
                    setTimeout(() => {
                        setThunderEffect(true);
                        setTimeout(() => setThunderEffect(false), duration / 2);
                    }, duration);
                }
            }, duration);
        }, delay);
    };

    const [thunderEffect, setThunderEffect] = useState(false);

    // Étape 3 de l'intro (affichage du titre et de l'icône)
    const IntroStep3 = () => (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 1.5, ease: "backOut" } }}
            className="pt-12"
        >
            <motion.p
                className="text-4xl text-white/90 mb-8"
                initial={{ letterSpacing: '0em' }}
                animate={{
                    letterSpacing: ['0em', '0.5em', '0em'],
                    textShadow: [
                        '0 0 0px rgba(255,255,255,0)',
                        `0 0 20px ${currentTheme.color}`,
                        '0 0 0px rgba(255,255,255,0)'
                    ]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2
                }}
            >
                {currentTheme.messages.intro}
            </motion.p>
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.3, 1],
                    y: [0, -20, 0],
                    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                }}
                className="text-6xl"
            >
                {currentTheme.icon}
            </motion.div>
        </motion.div>
    );

    // Étape 4 de l'intro (appel à l'action)
    const IntroStep4 = () => (
        <motion.div className="absolute bottom-20 left-0 right-0 text-center">
            <motion.p
                className="text-2xl text-white/80 mb-6"
                animate={{ scale: [1, 1.05, 1], transition: { duration: 2, repeat: Infinity } }}
            >
                {currentTheme.messages.challenge}
            </motion.p>
            <motion.div animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}>
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                    className="text-5xl cursor-pointer"
                    onClick={() => setShowIntro(false)}
                >
                    {currentTheme.arrowIcon ?? '👉'}
                </motion.div>
                <motion.p className="mt-4 text-lg text-white/60">
                    Cliquez pour commencer
                </motion.p>
            </motion.div>
        </motion.div>
    );

    const handleRevealClue = async (index: number) => {
        if (revealedClues.includes(index)) return;
        setRevealingClue(index);
        await new Promise(resolve => setTimeout(resolve, 1000));

        playClueReveal();

        confetti({
            particleCount: 100,
            angle: 270,
            spread: 50,
            origin: { x: 0.5, y: 0 },
            colors: [currentTheme.color, currentTheme.secondaryColor, currentTheme.color],
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
            colors: [currentTheme.color, currentTheme.secondaryColor, currentTheme.color],
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
                colors: [currentTheme.color, currentTheme.secondaryColor, currentTheme.color],
                shapes: ['circle', 'star'],
                scalar: 2.5
            });
        }
        setTimeout(() => {
            onFinish && onFinish();
        }, 3000);
    };

    return (
        <div className={`relative overflow-hidden min-h-screen ${currentTheme.bgColor} text-white`}>
            <LightningStrike active={thunderEffect} color={currentTheme.color} />

            {/* SVG avec effet d'éclair */}
            <svg className="absolute inset-0 pointer-events-none opacity-0" style={{ opacity: thunderEffect ? 1 : 0 }}>
                <defs>
                    <filter id="lightning-effect">
                        <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="10" result="turbulence" />
                        <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="20">
                            <animate attributeName="scale" values="1555;75;1555" keyTimes="0;0.5;1" dur="0.5s" repeatCount="indefinite" />
                        </feDisplacementMap>
                        <feGaussianBlur in="sourceGraphic" stdDeviation="1" />
                        <feMorphology operator="erode" radius="15">
                            <animate attributeName="radius" values="15;0;15" keyTimes="0;0.5;1" dur="0.5s" repeatCount="indefinite" />
                        </feMorphology>
                    </filter>
                </defs>
                <rect width="100%" height="100%" filter="url(#lightning-effect)" fill="white" />
            </svg>

            {/* Animation d'intro */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 z-50"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <AnimatePresence>
                            {thunderEffect && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0.9, 0], transition: { duration: 0.3 } }}
                                    className="fixed inset-0 z-40 pointer-events-none"
                                    style={{
                                        background: `linear-gradient(to right, #000 49%, ${currentTheme.color} 50%, #000 51%)`,
                                        filter: 'url(#lightning-effect)'
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Fond animé */}
                        <div className="absolute inset-0 overflow-hidden">
                            {[...Array(30)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full"
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
                                        height: `${Math.random() * 300 + 100}px`,
                                    }}
                                />
                            ))}
                        </div>

                        <motion.div className="relative z-10 text-center space-y-12 p-8 max-w-4xl mx-auto">
                            {introStep >= 1 && (
                                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }}>
                                    <motion.h1
                                        animate={{
                                            textShadow: [
                                                `0 0 20px ${currentTheme.color}`,
                                                `0 0 40px ${currentTheme.secondaryColor}`,
                                                `0 0 60px ${currentTheme.color}`
                                            ],
                                            y: [0, -20, 0]
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                                        className="text-8xl font-bold mb-6"
                                        style={{ color: currentTheme.color }}
                                    >
                                        {currentTheme.name}
                                    </motion.h1>
                                </motion.div>
                            )}

                            {introStep >= 2 && (
                                <motion.div
                                    className="flex flex-col items-center space-y-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1 }}
                                >
                                    <motion.div
                                        initial={{ x: -200, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 200 } }}
                                        className="text-5xl font-bold"
                                        style={{ color: teams?.[0]?.color || currentTheme.color }}
                                    >
                                        ÉQUIPE A : {teams?.[0]?.name || 'Equipe A'}
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1, transition: { duration: 1 } }} className="w-96 h-2 bg-white/50 rounded-full" />
                                    <motion.div
                                        initial={{ x: 200, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 200 } }}
                                        className="text-5xl font-bold"
                                        style={{ color: teams?.[1]?.color || currentTheme.secondaryColor }}
                                    >
                                        ÉQUIPE B : {teams?.[1]?.name || 'Equipe B'}
                                    </motion.div>
                                </motion.div>
                            )}

                            {introStep >= 3 && <IntroStep3 />}
                        </motion.div>

                        {introStep >= 4 && <IntroStep4 />}
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
                <motion.div initial={{ y: -50 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 300, delay: 0.5 }} className="text-center">
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                        className="text-6xl mb-6"
                    >
                        {currentTheme.icon}
                    </motion.div>
                    <h2
                        className="text-4xl font-bold mb-4"
                        style={{
                            background: `linear-gradient(45deg, ${currentTheme.color}, ${currentTheme.secondaryColor})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        {question.text}
                    </h2>
                    {question.hint && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-xl italic text-white/80">
                            {question.hint}
                        </motion.p>
                    )}
                </motion.div>

                {/* Indices */}
                <div className="space-y-6">
                    <div className="space-y-6">
                        <h3 className={`text-2xl font-semibold flex items-center gap-3 ${currentTheme.textColor}`}>
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            >
                                {currentTheme.indiceIcon ?? <Fingerprint className="h-8 w-8" />}
                            </motion.div>
                            Indices à découvrir
                        </h3>

                        {/* Vérification si le premier indice est vide */}
                        {(!question.clues?.[0]?.text || question.clues[0].text.trim() === '') ? (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="text-center py-16"
                            >
                                <motion.h2
                                    className="text-5xl font-bold mb-6"
                                    style={{
                                        background: `linear-gradient(45deg, ${currentTheme.color}, ${currentTheme.secondaryColor})`,
                                        WebkitBackgroundClip: 'text',

                                    }}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        textShadow: [
                                            `0 0 10px ${currentTheme.color}`,
                                            `0 0 20px ${currentTheme.secondaryColor}`,
                                            `0 0 10px ${currentTheme.color}`
                                        ]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    }}
                                >
                                    {currentTheme.emptyClueMessage || "RÉSOLVEZ L'ÉNIGME"}
                                </motion.h2>
                                <motion.p
                                    className="text-xl text-white/70"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    Utilisez les indices sonores pour trouver la solution
                                </motion.p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {question.clues?.map((clue, index) => (
                                    <motion.div
                                        key={index}
                                        layout
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            transition: { delay: index * 0.2 + 1, type: 'spring', stiffness: 300 }
                                        }}
                                        whileHover={{ scale: 1.03 }}
                                        onClick={() => handleRevealClue(index)}
                                        className={`p-6 rounded-xl cursor-pointer transition-all relative overflow-hidden border-2 ${
                                            revealedClues.includes(index) ? revealedClasses : 'border-gray-700 bg-gray-800 hover:border-yellow-400/50'
                                        }`}
                                    >
                                        <AnimatePresence>
                                            {revealingClue === index && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{
                                                        scale: 15,
                                                        opacity: 0,
                                                        transition: { duration: 1.2 }
                                                    }}
                                                    className="absolute inset-0 rounded-full"
                                                    style={{
                                                        background: `radial-gradient(circle, ${hexToRgba(currentTheme.color, 0.8)} 0%, ${hexToRgba(currentTheme.color, 0)} 70%)`
                                                    }}
                                                />
                                            )}
                                        </AnimatePresence>
                                        <div className="flex items-center gap-5">
                                            <motion.div
                                                className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0 ${
                                                    revealedClues.includes(index)
                                                        ? currentTheme.submitButtonClass
                                                        : 'bg-gray-700 text-gray-400'
                                                }`}
                                                animate={{ rotate: revealedClues.includes(index) ? 360 : 0, scale: revealingClue === index ? [1, 1.3, 1] : 1 }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                            >
                                                {revealedClues.includes(index) ? <Check className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
                                            </motion.div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                <span className={`text-xl font-medium ${revealedClues.includes(index) ? currentTheme.textColor : 'text-gray-400'}`}>
                  Indice {index + 1} - {clue.points} pts
                </span>
                                                    {revealedClues.includes(index) && (
                                                        <motion.span
                                                            animate={{ scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] }}
                                                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                                            className="text-3xl"
                                                        >
                                                            {currentTheme.emojis[index % currentTheme.emojis.length]}
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
                                                        <motion.p className="text-gray-400 italic mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                            Cliquez pour révéler
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
                {/* Zone de réponse */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="space-y-6">
                    <h3 className={`text-2xl font-semibold flex items-center gap-3 ${currentTheme.textColor}`}>
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        >
                            {currentTheme.responseIcon ?? <Fingerprint className="h-8 w-8" />}
                        </motion.div>
                        Votre hypothèse
                    </h3>
                    <div className="flex gap-4">
                        <motion.div className="flex-1 relative" whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <input
                                type="text"
                                value={userGuess}
                                onChange={(e) => setUserGuess(e.target.value)}
                                placeholder={currentTheme.inputPlaceholder ?? "Votre hypothèse..."}
                                className={`w-full px-6 py-4 bg-gray-700 border-2 rounded-xl text-white placeholder-gray-400 outline-none text-xl ${
                                    hasGuessed
                                        ? userGuess.toLowerCase() === question.solution?.toLowerCase()
                                            ? 'border-green-500'
                                            : 'border-red-500'
                                        : currentTheme.inputBorderClass ?? 'border-default'
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
                                boxShadow: `0 0 25px ${currentTheme.hoverShadowColor ?? 'rgba(0,0,0,0.5)'}`
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmitGuess}
                            disabled={!userGuess.trim() || hasGuessed}
                            className={`px-8 py-4 rounded-xl font-bold disabled:opacity-50 flex items-center gap-3 text-xl ${currentTheme.submitButtonClass ?? ''}`}
                        >
                            <motion.span animate={{ scale: [1, 1.3, 1], transition: { repeat: Infinity, duration: 3 } }}>
                                {currentTheme.guessIcon ?? '🔍'}
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
                                    <motion.div className="text-4xl">
                                        {currentTheme.successIcon ?? '🎯'}
                                    </motion.div>
                                    <span>{currentTheme.messages.success ?? 'Brillante déduction !'}</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    <motion.div className="text-4xl">
                                        {currentTheme.failureIcon ?? '❌'}
                                    </motion.div>
                                    <span>{currentTheme.messages.failure ?? 'Essayez encore !'}</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </motion.div>

                {/* Section Solution */}
                <AnimatePresence>
                    {(revealedClues.length === question.clues?.length || showSolution) && (
                        <motion.div className={`p-8 rounded-xl border-2 mt-8 text-center ${currentTheme.solutionBgClass ?? 'bg-default/30'} ${currentTheme.solutionBorderClass ?? 'border-default'}`}>
                            <div className="flex flex-col items-center">
                                <motion.div className="text-6xl mb-6">
                                    {currentTheme.solutionIcon ?? '🎉'}
                                </motion.div>
                                <h4 className={`text-3xl font-bold mb-4 ${currentTheme.textColor}`}>
                                    {currentTheme.messages.success}
                                </h4>
                                <motion.p className="text-4xl font-bold mb-8 text-white">
                                    {question.solution}
                                </motion.p>
                                <motion.div className="text-5xl">
                                    {currentTheme.solutionIconAlt ?? '🎊'}
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bouton Révéler la solution */}
                {!showSolution && revealedClues.length < (question.clues?.length || 0) && (
                    <motion.button
                        whileHover={{
                            scale: 1.05,
                            boxShadow: `0 0 25px ${currentTheme.hoverShadowColor ?? 'rgba(0,0,0,0.5)'}`
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleShowSolution}
                        className={`w-full py-4 rounded-xl font-bold mt-8 flex items-center justify-center gap-3 text-xl ${currentTheme.revealButtonClass ?? ''}`}
                    >
                        <Sparkles className="h-6 w-6" />
                        {currentTheme.revealButtonText ?? 'Révéler la solution'}
                        <Sparkles className="h-6 w-6" />
                    </motion.button>
                )}

                    </motion.div>
        </div>
);
};

export default IdentificationQuestion;
