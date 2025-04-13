import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, Sparkles, Telescope, Fingerprint, Zap, Ghost } from "lucide-react";
import confetti from "canvas-confetti";

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
        type: "identification";
        clues?: IdentificationClue[];
        solution?: string;
    };
    teams: Team[];
    // Callback pour notifier la fin de la question d'identification
    onFinish?: () => void;
}

export const IdentificationQuestion: React.FC<IdentificationQuestionProps> = ({ question, teams, onFinish }) => {
    const [revealedClues, setRevealedClues] = useState<number[]>([]);
    const [showSolution, setShowSolution] = useState(false);
    const [userGuess, setUserGuess] = useState("");
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        confetti({
            particleCount: 100,
            angle: 270,
            spread: 50,
            origin: { x: 0.5, y: 0 },
            colors: spookyMode
                ? ["#8b5cf6", "#ec4899", "#d946ef"]
                : ["#f59e0b", "#3b82f6", "#10b981"],
            shapes: ["circle", "star"],
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
                ? ["#8b5cf6", "#ec4899"]
                : ["#10b981", "#84cc16", "#f59e0b"],
            shapes: ["circle", "star"],
            scalar: 1.8,
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
                    ? ["#8b5cf6", "#ec4899", "#a855f7"]
                    : ["#10b981", "#84cc16", "#f59e0b"],
                shapes: ["circle", "star"],
                scalar: 2.5,
            });
        }
        // Appeler onFinish après 3 secondes (modifiable ou supprimer le délai)
        setTimeout(() => {
            onFinish && onFinish();
        }, 3000);
    };

    const primaryColor = spookyMode ? "#8b5cf6" : "#f59e0b";
    const secondaryColor = spookyMode ? "#ec4899" : "#3b82f6";
    const bgColor = spookyMode ? "bg-gray-900" : "bg-gray-800";
    const textColor = spookyMode ? "text-purple-400" : "text-yellow-400";

    return (
        <div className={`relative overflow-hidden min-h-screen ${bgColor} text-white`}>
            {/* Animation d'intro en plein écran */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 z-50"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <div className="absolute inset-0 overflow-hidden">
                            {[...Array(30)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className={`absolute rounded-full ${spookyMode ? "bg-purple-500/10" : "bg-yellow-400/10"}`}
                                    initial={{
                                        x: Math.random() * window.innerWidth,
                                        y: Math.random() * window.innerHeight,
                                        scale: 0,
                                        opacity: 0,
                                    }}
                                    animate={{
                                        scale: [0, Math.random() * 2 + 1, 0],
                                        opacity: [0, 0.4, 0],
                                        x: Math.random() * window.innerWidth,
                                        y: Math.random() * window.innerHeight,
                                    }}
                                    transition={{
                                        duration: Math.random() * 20 + 10,
                                        repeat: Infinity,
                                        ease: "linear",
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
                                                `0 0 20px ${primaryColor}`,
                                                `0 0 40px ${secondaryColor}`,
                                                `0 0 60px ${primaryColor}`,
                                            ],
                                            y: [0, -20, 0],
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                                        className="text-8xl font-bold mb-6"
                                        style={{ color: primaryColor }}
                                    >
                                        {spookyMode ? "MYSTÈRE" : "IDENTIFICATION"}
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
                                        animate={{
                                            x: 0,
                                            opacity: 1,
                                            transition: { type: "spring", stiffness: 200 },
                                        }}
                                        className="text-5xl font-bold"
                                        style={{ color: teams?.[0]?.color || primaryColor }}
                                    >
                                        ÉQUIPE A : {teams?.[0]?.name || "Equipe A"}
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scaleX: 0 }}
                                        animate={{ opacity: 1, scaleX: 1, transition: { duration: 1 } }}
                                        className="w-64 h-1 bg-white"
                                    />
                                    <motion.div
                                        initial={{ x: 200, opacity: 0 }}
                                        animate={{
                                            x: 0,
                                            opacity: 1,
                                            transition: { type: "spring", stiffness: 200 },
                                        }}
                                        className="text-5xl font-bold"
                                        style={{ color: teams?.[1]?.color || secondaryColor }}
                                    >
                                        ÉQUIPE B : {teams?.[1]?.name || "Equipe B"}
                                    </motion.div>
                                </motion.div>
                            )}
                            {introStep >= 3 && (
                                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0, transition: { duration: 1.5 } }} className="pt-12">
                                    <motion.p className="text-4xl text-white/90 mb-8">
                                        {spookyMode ? "Un défi spectral vous attend..." : "Préparez-vous pour le défi !"}
                                    </motion.p>
                                    <motion.div animate={{ scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 2 } }} className="text-6xl">
                                        {spookyMode ? "👻" : "🕵️‍♂️"}
                                    </motion.div>
                                </motion.div>
                            )}
                        </motion.div>
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
                <motion.div initial={{ y: -50 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 300, delay: 0.5 }} className="text-center">
                    <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="text-6xl mb-6">
                        {spookyMode ? "👻" : "🕵️‍♂️"}
                    </motion.div>
                    <h2
                        className="text-4xl font-bold mb-4"
                        style={{
                            background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
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

                {/* Zone de réponse et indices */}
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={userGuess}
                            onChange={(e) => setUserGuess(e.target.value)}
                            placeholder={spookyMode ? "Quel est ce spectre ?" : "Qui ou quoi suis-je ?"}
                            className={`w-full px-6 py-4 bg-gray-700 border-2 rounded-xl text-white placeholder-gray-400 outline-none text-xl ${
                                hasGuessed
                                    ? userGuess.toLowerCase() === question.solution?.toLowerCase()
                                        ? "border-green-500"
                                        : "border-red-500"
                                    : spookyMode
                                        ? "border-purple-500 focus:border-pink-500"
                                        : "border-yellow-400 focus:border-yellow-500"
                            }`}
                            disabled={hasGuessed}
                        />
                        <button
                            onClick={handleSubmitGuess}
                            disabled={!userGuess.trim() || hasGuessed}
                            className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900"
                        >
                            Valider
                        </button>
                    </div>
                    {hasGuessed && (
                        <div
                            className={`p-5 rounded-xl text-center font-bold text-xl ${
                                userGuess.toLowerCase() === question.solution?.toLowerCase()
                                    ? "bg-green-900/40 border-2 border-green-500 text-green-400"
                                    : "bg-red-900/40 border-2 border-red-500 text-red-400"
                            }`}
                        >
                            {userGuess.toLowerCase() === question.solution?.toLowerCase()
                                ? "Bravo, c'est la bonne réponse !"
                                : "Mauvaise réponse..."}
                        </div>
                    )}
                    {!showSolution && question.clues && revealedClues.length < question.clues.length && (
                        <button onClick={handleShowSolution} className="px-4 py-2 rounded bg-purple-500 text-white font-bold">
                            Révéler la solution
                        </button>
                    )}
                    <button onClick={() => onFinish && onFinish()} className="px-4 py-2 rounded bg-red-500 text-white font-bold">
                        Ignorer
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default IdentificationQuestion;
