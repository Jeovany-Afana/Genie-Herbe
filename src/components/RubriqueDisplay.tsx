import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Loader2, Star, AlertTriangle, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

// Import du composant IdentificationQuestion
import { IdentificationQuestion } from "./IdentificationQuestion";

export interface Answer {
    id: string;
    text: string;
    isCorrect: boolean;
}

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

export interface Team {
    id: string;
    name: string;
    color: string;
}

export interface RubriqueDisplayProps {
    teams: Team[];
}

const RubriqueDisplay: React.FC<RubriqueDisplayProps> = ({ teams }) => {
    const [rubriques, setRubriques] = useState<Rubrique[]>([]);
    const [currentRubriqueIndex, setCurrentRubriqueIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [showQuestion, setShowQuestion] = useState(false);
    const [showAnswers, setShowAnswers] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Récupération des rubriques depuis Firestore
    useEffect(() => {
        const fetchRubriques = async () => {
            try {
                const rubriquesRef = collection(db, "rubriques");
                const q = query(rubriquesRef, orderBy("createdAt", "asc"));
                const querySnapshot = await getDocs(q);
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

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#ffde59", "#ff914d", "#ff5757", "#8c52ff"],
        });
    };

    const handleRevealQuestion = () => {
        setShowQuestion(true);
        setCurrentQuestionIndex(0);
        triggerConfetti();
    };

    const handleRevealAnswers = () => {
        setShowAnswers(true);
        const currentQuestion = rubriques[currentRubriqueIndex].questions[currentQuestionIndex];
        const correctAnswers = currentQuestion.answers.filter(a => a.isCorrect);
        if (correctAnswers.length > 0) {
            confetti({
                particleCount: 50 * correctAnswers.length,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#ffde59", "#ff914d"],
            });
        }
    };

    const handleNextQuestion = async () => {
        setIsTransitioning(true);
        triggerConfetti();
        await new Promise(resolve => setTimeout(resolve, 800));
        const currentRubrique = rubriques[currentRubriqueIndex];

        if (currentQuestionIndex < currentRubrique.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setShowAnswers(false);
        } else {
            if (currentRubriqueIndex < rubriques.length - 1) {
                setCurrentRubriqueIndex(currentRubriqueIndex + 1);
            } else {
                setCurrentRubriqueIndex(0);
            }
            // Réinitialiser l'état et afficher à nouveau le bouton pour démarrer la rubrique
            setCurrentQuestionIndex(-1);
            setShowQuestion(false);
            setShowAnswers(false);
        }
        setIsTransitioning(false);
        triggerConfetti();
    };

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

    // Définition d'un booléen pour déterminer si la question courante est d'identification
    const isIdentification =
        rubriques.length > 0 &&
        currentQuestionIndex >= 0 &&
        currentRubrique.questions[currentQuestionIndex]?.type === "identification";

    return (
        <motion.div
            className={
                isIdentification
                    ? "fixed inset-0 z-50 overflow-y-auto"  // Mode plein écran pour l’identification
                    : "glass-effect rounded-2xl p-6 border-2 border-yellow-400/30 w-full max-w-2xl mx-auto relative overflow-hidden"
            }
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Nouvel effet de particules amélioré */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        className="absolute inset-0 z-50 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {[...Array(30)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    opacity: 0,
                                    scale: 0,
                                    x: 0,
                                    y: 0,
                                    rotate: 0
                                }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.5, 0],
                                    x: [0, (Math.random() - 0.5) * 300],
                                    y: [0, (Math.random() - 0.5) * 300],
                                    rotate: [0, Math.random() * 720],
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.03,
                                    ease: "easeOut",
                                }}
                                className="absolute text-yellow-400"
                                style={{
                                    left: `${50 + (Math.random() - 0.5) * 20}%`,
                                    top: `${50 + (Math.random() - 0.5) * 20}%`,
                                }}
                            >
                                <Sparkles size={24} />
                            </motion.div>
                        ))}

                        {/* Effet de flash */}
                        <motion.div
                            className="absolute inset-0 bg-white"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0, 0.7, 0],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 0.8 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header de la rubrique */}
            <motion.div
                className="flex items-start justify-between mb-4"
                key={`rubrique-${currentRubriqueIndex}`}
                initial={{ opacity: 0, y: -50, rotateX: 90 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: isTransitioning ? 0.5 : 0
                    }
                }}
                exit={{ opacity: 0, y: 50, rotateX: -90 }}
            >
                <div>
                    <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                        <motion.div
                            animate={{
                                rotate: [0, 20, -20, 0],
                                scale: [1, 1.2, 1],
                                transition: {
                                    repeat: Infinity,
                                    duration: 3,
                                    ease: "easeInOut"
                                }
                            }}
                        >
                            <Star className="h-6 w-6" />
                        </motion.div>
                        {currentRubrique.title}
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                            className="ml-2 text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full"
                        >
                            NEW!
                        </motion.span>
                    </h2>
                    <motion.p
                        className="text-white/80 mt-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            transition: { delay: 0.4 }
                        }}
                    >
                        {currentRubrique.description}
                    </motion.p>
                </div>
                <motion.span
                    className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full flex items-center"
                    initial={{ scale: 0 }}
                    animate={{
                        scale: 1,
                        transition: {
                            type: "spring",
                            delay: 0.5,
                            stiffness: 500
                        }
                    }}
                >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {currentRubriqueIndex + 1}/{rubriques.length}
                </motion.span>
            </motion.div>

            <AnimatePresence mode="wait">
                {!showQuestion ? (
                    // Bouton "Commencer la rubrique" avec animation améliorée
                    <motion.div
                        key="initial"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            transition: {
                                type: "spring",
                                stiffness: 400,
                                damping: 10
                            }
                        }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex justify-center items-center h-32"
                    >
                        <motion.button
                            whileHover={{
                                scale: 1.1,
                                boxShadow: "0 0 20px rgba(255, 222, 89, 0.5)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRevealQuestion}
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 py-3 px-6 rounded-xl font-bold text-lg flex items-center gap-2 relative overflow-hidden"
                            initial={{ rotate: -5 }}
                            animate={{
                                rotate: [0, -5, 5, 0],
                                transition: {
                                    repeat: Infinity,
                                    duration: 3
                                }
                            }}
                        >
                            <motion.span
                                initial={{ x: -20 }}
                                animate={{
                                    x: 0,
                                    transition: {
                                        type: "spring",
                                        stiffness: 500
                                    }
                                }}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </motion.span>
                            <span>Commencer la rubrique</span>
                            <motion.div
                                className="absolute inset-0 bg-white/20"
                                initial={{ x: "-100%" }}
                                animate={{
                                    x: "100%",
                                    transition: {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }
                                }}
                            />
                            {/* Effet de halo pulsé */}
                            <motion.div
                                className="absolute inset-0 rounded-xl border-2 border-yellow-400/50 pointer-events-none"
                                initial={{ scale: 1, opacity: 0 }}
                                animate={{
                                    scale: 1.5,
                                    opacity: [0, 0.4, 0],
                                    transition: {
                                        duration: 2,
                                        repeat: Infinity
                                    }
                                }}
                            />
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="question"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                                delay: isTransitioning ? 0.5 : 0
                            }
                        }}
                        exit={{ opacity: 0, y: -50 }}
                        className="space-y-6"
                    >
                        {currentQuestion && currentQuestion.type === "identification" ? (
                            <IdentificationQuestion
                                question={currentQuestion}
                                teams={teams}
                                onFinish={handleNextQuestion}
                            />
                        ) : (
                            <>
                                {/* Contenu des questions avec animations améliorées */}
                                <motion.div
                                    className="glass-effect-inner p-4 rounded-lg border border-yellow-400/20 relative overflow-hidden"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        transition: {
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 20,
                                            delay: isTransitioning ? 0.6 : 0
                                        }
                                    }}
                                    whileHover={{
                                        y: -5,
                                        boxShadow: "0 10px 20px rgba(255, 222, 89, 0.2)"
                                    }}
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 animate-gradient-x" />
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-semibold text-yellow-400">
                                            Question {currentQuestionIndex + 1}/{currentRubrique.questions.length}
                                        </h3>
                                    </div>
                                    <motion.p
                                        className="text-white mt-2 text-lg"
                                        initial={{ opacity: 0 }}
                                        animate={{
                                            opacity: 1,
                                            transition: {
                                                delay: isTransitioning ? 0.7 : 0.2
                                            }
                                        }}
                                    >
                                        {currentQuestion.text}
                                    </motion.p>
                                    {currentQuestion.hint && (
                                        <motion.p
                                            className="text-sm text-yellow-400/70 mt-2 flex items-center"
                                            initial={{ opacity: 0 }}
                                            animate={{
                                                opacity: 1,
                                                transition: {
                                                    delay: isTransitioning ? 0.8 : 0.3
                                                }
                                            }}
                                        >
                                            <motion.span
                                                animate={{
                                                    rotate: [0, 20, -20, 0],
                                                    transition: { repeat: Infinity, duration: 3 }
                                                }}
                                            >
                                                💡
                                            </motion.span>
                                            Indice: {currentQuestion.hint}
                                        </motion.p>
                                    )}
                                </motion.div>

                                <AnimatePresence>
                                    {!showAnswers ? (
                                        <motion.button
                                            key="show-answers-btn"
                                            whileHover={{
                                                scale: 1.05,
                                                boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)"
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleRevealAnswers}
                                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-bold text-lg relative overflow-hidden"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                transition: {
                                                    delay: isTransitioning ? 0.9 : 0
                                                }
                                            }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <span className="relative z-10">Révéler les réponses</span>
                                            <motion.div
                                                className="absolute inset-0 bg-white/20"
                                                initial={{ x: "-100%" }}
                                                animate={{
                                                    x: "100%",
                                                    transition: {
                                                        duration: 2,
                                                        repeat: Infinity
                                                    }
                                                }}
                                            />
                                        </motion.button>
                                    ) : (
                                        <motion.div
                                            key="answers"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                                transition: {
                                                    type: "spring",
                                                    damping: 20,
                                                    stiffness: 200,
                                                    delay: isTransitioning ? 0.5 : 0
                                                },
                                            }}
                                            className="space-y-3 overflow-hidden"
                                        >
                                            <motion.h4
                                                className="text-lg font-semibold text-yellow-400"
                                                initial={{ x: -20 }}
                                                animate={{ x: 0 }}
                                            >
                                                Réponses :
                                            </motion.h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {currentQuestion.answers.map((answer, index) => (
                                                    <motion.div
                                                        key={answer.id}
                                                        initial={{ opacity: 0, x: -30 }}
                                                        animate={{
                                                            opacity: 1,
                                                            x: 0,
                                                            transition: {
                                                                type: "spring",
                                                                stiffness: 300,
                                                                delay: isTransitioning ? 0.6 + index * 0.1 : index * 0.1
                                                            },
                                                        }}
                                                        whileHover={{
                                                            scale: 1.03,
                                                            y: -3
                                                        }}
                                                        className={`p-3 rounded-lg border-2 ${
                                                            answer.isCorrect
                                                                ? "border-green-500 bg-green-500/10 hover:shadow-lg hover:shadow-green-500/20"
                                                                : "border-red-500 bg-red-500/10 hover:shadow-lg hover:shadow-red-500/20"
                                                        } transition-all duration-300`}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            {answer.isCorrect ? (
                                                                <motion.div
                                                                    animate={{
                                                                        scale: [1, 1.2, 1],
                                                                        transition: { repeat: 1 }
                                                                    }}
                                                                >
                                                                    <Check className="h-5 w-5 text-green-400" />
                                                                </motion.div>
                                                            ) : (
                                                                <span className="h-5 w-5 text-red-400">✕</span>
                                                            )}
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

                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 0 20px rgba(255, 222, 89, 0.5)"
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNextQuestion}
                            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 py-3 rounded-xl font-bold text-lg mt-4 relative overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                    delay: isTransitioning ? 1.0 : 0.2
                                }
                            }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {currentQuestionIndex < currentRubrique.questions.length - 1
                                    ? "Question suivante →"
                                    : "Rubrique suivante →"}
                            </span>
                            <motion.div
                                className="absolute inset-0 bg-white/20"
                                initial={{ x: "-100%" }}
                                animate={{
                                    x: "100%",
                                    transition: {
                                        duration: 2,
                                        repeat: Infinity
                                    }
                                }}
                            />
                            {/* Effet de halo */}
                            <motion.div
                                className="absolute inset-0 rounded-xl border-2 border-yellow-400/30 pointer-events-none"
                                initial={{ scale: 1, opacity: 0 }}
                                animate={{
                                    scale: 1.2,
                                    opacity: [0, 0.3, 0],
                                    transition: {
                                        duration: 2,
                                        repeat: Infinity
                                    }
                                }}
                            />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default RubriqueDisplay;
