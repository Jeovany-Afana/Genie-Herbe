// src/components/TeamQuestion.tsx
import React, { useState, useEffect } from 'react';
import useSound from 'use-sound';
import introSound1 from '/sounds/intro1.mp3';
import clueRevealSound from '/sounds/clue-reveal.mp3';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface Answer {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface Team {
    id: string;
    name: string;
    color: string;
}

export interface TeamQuestionProps {
    question: {
        id: string;
        text: string;
        hint?: string;
        type: 'parEquipe';
        answers: Answer[];
        team: string;          // id de l’équipe concernée
    };
    teams: Team[];
    onFinish?: () => void;
}

const TeamQuestion: React.FC<TeamQuestionProps> = ({ question, teams, onFinish }) => {
    // État intro plein‑écran
    const [showIntro, setShowIntro] = useState(true);
    const [introStep, setIntroStep] = useState(0);
    // Recherche de l’équipe
    const [currentTeam, setCurrentTeam] = useState<Team | undefined>(undefined);
    // Sélection & validation
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Sons
    const [playIntro] = useSound(introSound1);
    const [playReveal] = useSound(clueRevealSound);

    // 1) Initialisation de l’équipe
    useEffect(() => {
        setCurrentTeam(teams.find(t => t.id === question.team));
    }, [question.team, teams]);

    // 2) Séquence d’intro à plusieurs étapes
    useEffect(() => {
        const timers = [
            setTimeout(() => setIntroStep(1), 1000),  // Affiche le titre
            setTimeout(() => setIntroStep(2), 2500),  // Affiche le nom d’équipe
            setTimeout(() => setIntroStep(3), 4500),  // Affiche la question
            setTimeout(() => {
                setShowIntro(false);
                playIntro();
            }, 6500),
        ];
        return () => timers.forEach(clearTimeout);
    }, [playIntro]);

    // 3) Gérer la sélection de réponse (single vs multiple)
    const handleSelect = (id: string) => {
        if (hasSubmitted) return;
        const correctCount = question.answers.filter(a => a.isCorrect).length;
        if (correctCount === 1) {
            setSelectedIds([id]);
        } else {
            setSelectedIds(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            );
        }
    };

    // 4) Soumission & confettis
    const handleSubmit = () => {
        setHasSubmitted(true);
        const correctIds = question.answers.filter(a => a.isCorrect).map(a => a.id);
        const isRight =
            selectedIds.length === correctIds.length &&
            selectedIds.every(id => correctIds.includes(id));
        if (isRight) {
            confetti({ particleCount: 200, spread: 100, colors: [currentTeam?.color || '#fff'] });
        }
        playReveal();
        setTimeout(() => onFinish?.(), 2000);
    };

    // --- RENDU ---
    if (showIntro) {
        return (
            <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 text-white">
                <AnimatePresence>
                    {introStep >= 1 && (
                        <motion.h1
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl font-black mb-4"
                        >
                            QUESTION PAR ÉQUIPE
                        </motion.h1>
                    )}
                    {introStep >= 2 && (
                        <motion.h2
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl mb-6"
                            style={{ color: currentTeam?.color }}
                        >
                            ÉQUIPE : {currentTeam?.name}
                        </motion.h2>
                    )}
                    {introStep >= 3 && (
                        <motion.p
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-2xl max-w-xl text-center px-4"
                        >
                            {question.text}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-900 text-white p-8 flex flex-col z-40">
            {/* En‑tête question */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold">{question.text}</h2>
                {question.hint && <p className="italic text-gray-300 mt-2">{question.hint}</p>}
            </div>

            {/* Choix des réponses */}
            <div className="flex-1 grid gap-4 auto-rows-min">
                {question.answers.map(ans => (
                    <button
                        key={ans.id}
                        onClick={() => handleSelect(ans.id)}
                        disabled={hasSubmitted}
                        className={`
              w-full py-4 rounded-lg border-2 
              ${selectedIds.includes(ans.id)
                            ? 'bg-indigo-600 border-indigo-400'
                            : 'bg-gray-800 border-gray-700 hover:border-gray-500'}
              transition-colors
              flex items-center justify-between
              `}
                    >
                        <span>{ans.text}</span>
                        {hasSubmitted && (ans.isCorrect ? <Check /> : <X />)}
                    </button>
                ))}
            </div>

            {/* Bouton Valider */}
            <button
                onClick={handleSubmit}
                disabled={hasSubmitted || selectedIds.length === 0}
                className={`mt-6 py-3 rounded-xl font-bold text-lg
          ${selectedIds.length > 0
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-700 cursor-not-allowed'}
          transition-all`}
            >
                Valider
            </button>
        </div>
    );
};

export default TeamQuestion;
