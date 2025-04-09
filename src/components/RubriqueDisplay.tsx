// src/components/RubriqueDisplay.tsx
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Loader2, Star, AlertTriangle } from "lucide-react";
import confetti from 'canvas-confetti';

// Import du composant dédié pour les questions d'identification
import { IdentificationQuestion } from './IdentificationQuestion';

export interface Answer {
    id: string;
    text: string;
    isCorrect: boolean;
}

// Mise à jour de l'interface Question pour inclure identification
export interface Question {
    id: string;
    text: string;
    hint?: string;
    type: "single" | "multiple" | "identification";
    answers: Answer[];
    clues?: { text: string; points: number; revealed: boolean }[];
    solution?: string;
}

export interface Rubrique {
    id: string;
    title: string;
    description: string;
    restrictions: string;
    questions: Question[];
}

export const RubriqueDisplay: React.FC = () => {
    const [rubriques, setRubriques] = useState<Rubrique[]>([]);
    const [currentRubriqueIndex, setCurrentRubriqueIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [showQuestion, setShowQuestion] = useState(false);
    const [showAnswers, setShowAnswers] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Récupération des rubriques depuis Firestore
    useEffect(() => {
        const fetchRubriques = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "rubriques"));
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Rubrique[];
                setRubriques(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des rubriques:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRubriques();
    }, []);

    if (isLoading) {
        return (
            <div className="glass-effect rounded-xl p-6 border-2 border-yellow-400/30 flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 text-yellow-400 animate-spin" />
            </div>
        );
    }

    if (rubriques.length === 0) {
        return (
            <div className="glass-effect rounded-xl p-6 border-2 border-yellow-400/30 text-yellow-400 flex items-center justify-center h-40">
                <AlertTriangle className="h-6 w-6 mr-2" />
                Aucune rubrique disponible
            </div>
        );
    }

    const currentRubrique = rubriques[currentRubriqueIndex];
    const currentQuestion = currentRubrique.questions[currentQuestionIndex];

    const handleRevealQuestion = () => {
        setShowQuestion(true);
        setCurrentQuestionIndex(0);
    };

    const handleRevealAnswers = () => {
        setShowAnswers(true);
        const correctAnswers = currentQuestion.answers.filter(a => a.isCorrect);
        if (correctAnswers.length > 0) {
            confetti({
                particleCount: 50 * correctAnswers.length,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < currentRubrique.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setShowAnswers(false);
        } else {
            if (currentRubriqueIndex < rubriques.length - 1) {
                setCurrentRubriqueIndex(currentRubriqueIndex + 1);
                setCurrentQuestionIndex(-1);
                setShowQuestion(false);
                setShowAnswers(false);
            } else {
                setCurrentRubriqueIndex(0);
                setCurrentQuestionIndex(-1);
                setShowQuestion(false);
                setShowAnswers(false);
            }
        }
    };

    return (
        <motion.div
            className="glass-effect rounded-2xl p-6 border-2 border-yellow-400/30 w-full max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Rubrique Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                        <Star className="h-6 w-6" />
                        {currentRubrique.title}
                    </h2>
                    <p className="text-white/80 mt-1">{currentRubrique.description}</p>
                </div>
                <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full">
          {currentRubriqueIndex + 1}/{rubriques.length}
        </span>
            </div>

            <AnimatePresence mode="wait">
                {!showQuestion ? (
                    <motion.div
                        key="initial"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-center items-center h-32"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRevealQuestion}
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 py-3 px-6 rounded-xl font-bold text-lg flex items-center gap-2"
                        >
                            <ChevronRight className="h-6 w-6" />
                            Commencer la rubrique
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="question"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Pour les questions classiques */}
                        {currentQuestion && currentQuestion.type !== 'identification' && (
                            <>
                                <motion.div
                                    className="glass-effect-inner p-4 rounded-lg border border-yellow-400/20"
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-semibold text-yellow-400">
                                            Question {currentQuestionIndex + 1}/{currentRubrique.questions.length}
                                        </h3>
                                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                      {currentQuestion.type === 'single' ? 'Réponse unique' : 'Multiples réponses'}
                    </span>
                                    </div>
                                    <p className="text-white mt-2 text-lg">{currentQuestion.text}</p>
                                    {currentQuestion.hint && (
                                        <p className="text-sm text-yellow-400/70 mt-2">Indice: {currentQuestion.hint}</p>
                                    )}
                                </motion.div>

                                <AnimatePresence>
                                    {!showAnswers ? (
                                        <motion.button
                                            key="show-answers-btn"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleRevealAnswers}
                                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold text-lg"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            Révéler les réponses
                                        </motion.button>
                                    ) : (
                                        <motion.div
                                            key="answers"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                                transition: {
                                                    type: 'spring',
                                                    damping: 20,
                                                    stiffness: 200
                                                }
                                            }}
                                            className="space-y-3 overflow-hidden"
                                        >
                                            <h4 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
                                                <Star className="h-5 w-5" />
                                                Réponses :
                                            </h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {currentQuestion.answers.map((answer) => (
                                                    <motion.div
                                                        key={answer.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{
                                                            opacity: 1,
                                                            x: 0,
                                                            transition: {
                                                                delay: answer.isCorrect ? 0.3 : 0.1
                                                            }
                                                        }}
                                                        whileHover={{ scale: 1.02 }}
                                                        className={`p-3 rounded-lg border-2 ${answer.isCorrect
                                                            ? 'border-green-500 bg-green-500/10'
                                                            : 'border-red-500 bg-red-500/10'}`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center 
                                ${answer.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                                                <Check className="h-3 w-3 text-white" />
                                                            </div>
                                                            <p className="text-white">{answer.text}</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}

                        {/* Pour les questions d'identification, on affiche le composant dédié */}
                        {currentQuestion && currentQuestion.type === 'identification' && (
                            <IdentificationQuestion question={currentQuestion} />
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNextQuestion}
                            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 py-3 rounded-xl font-bold text-lg mt-4"
                        >
                            {currentQuestionIndex < currentRubrique.questions.length - 1
                                ? "Question suivante →"
                                : "Rubrique suivante →"}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default RubriqueDisplay;
