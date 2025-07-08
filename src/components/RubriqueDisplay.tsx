import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Loader2, Star, AlertTriangle, Sparkles, Volume2 } from "lucide-react";
import confetti from "canvas-confetti";
import { Howl } from 'howler';

// Import du composant IdentificationQuestion
import { IdentificationQuestion } from "./IdentificationQuestion";

// Sons
const transitionSound = new Howl({ src: ['/sounds/transition.mp3'] });
const correctSound = new Howl({ src: ['/sounds/correct.mp3'] });
const revealSound = new Howl({ src: ['/sounds/reveal.mp3'] });

export interface Answer {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: string;
    text: string;
    hint?: string;

    /* 🚩 Ajout de 'flag' */
    type: "single" | "multiple" | "identification" | "flag";

    /* pour single / multiple */
    answers?: Answer[];
    /* pour identification */
    clues?: { text: string; points: number; revealed: boolean }[];
    solution?: string;

    /* pour flag */
    imageUrl?: string;
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
    const [isMuted, setIsMuted] = useState(false);

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
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
            colors: ["#ffde59", "#ff914d", "#ff5757", "#8c52ff", "#00b4d8"],
        });
    };

    const playSound = (sound: Howl) => {
        if (!isMuted) {
            sound.play();
        }
    };

    const handleRevealQuestion = () => {
        playSound(revealSound);
        setShowQuestion(true);
        setCurrentQuestionIndex(0);
        triggerConfetti();
    };

    const handleRevealAnswers = () => {
        playSound(correctSound);
        setShowAnswers(true);
        const currentQuestion = rubriques[currentRubriqueIndex].questions[currentQuestionIndex];
        const correctAnswers = currentQuestion.answers.filter(a => a.isCorrect);

        if (correctAnswers.length > 0) {
            confetti({
                particleCount: 80 * correctAnswers.length,
                spread: 90,
                origin: { y: 0.6 },
                colors: ["#ffde59", "#ff914d", "#00b4d8"],
            });
        }
    };

    const handleNextQuestion = async () => {
        playSound(transitionSound);
        setIsTransitioning(true);
        triggerConfetti();

        await new Promise(resolve => setTimeout(resolve, 1000));

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
            setCurrentQuestionIndex(-1);
            setShowQuestion(false);
            setShowAnswers(false);
        }

        setIsTransitioning(false);
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
    const isIdentOrFlag =
        currentQuestion?.type === "identification" ||
        currentQuestion?.type === "flag";


    return (
        <motion.div
            className={
                isIdentOrFlag
                    ? "fixed inset-0 z-50 overflow-y-auto"
                    : "glass-effect rounded-2xl p-6 border-2 border-yellow-400/30 w-full max-w-2xl mx-auto relative overflow-hidden"
            }
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Bouton mute */}
            <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-4 right-4 z-50 text-yellow-400 hover:text-yellow-300 transition-colors"
                aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
            >
                <Volume2 className={`h-5 w-5 ${isMuted ? 'opacity-50' : ''}`} />
            </button>

            {/* Animation de transition entre rubriques/questions */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Effet de particules étoilées */}
                        {[...Array(50)].map((_, i) => (
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
                                    x: [0, (Math.random() - 0.5) * 400],
                                    y: [0, (Math.random() - 0.5) * 400],
                                    rotate: [0, Math.random() * 720],
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.02,
                                    ease: "easeOut",
                                }}
                                className="absolute text-yellow-400"
                                style={{
                                    left: `${50 + (Math.random() - 0.5) * 20}%`,
                                    top: `${50 + (Math.random() - 0.5) * 20}%`,
                                }}
                            >
                                <Sparkles size={28} />
                            </motion.div>
                        ))}

                        {/* Effet de flash avec couleur aléatoire */}
                        <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0, 0.8, 0],
                                scale: [1, 1.5, 1],
                                backgroundColor: [
                                    'rgba(255, 222, 89, 0)',
                                    `rgba(${
                                        Math.floor(Math.random() * 255)
                                    }, ${
                                        Math.floor(Math.random() * 255)
                                    }, ${
                                        Math.floor(Math.random() * 255)
                                    }, 0.8)`,
                                    'rgba(255, 222, 89, 0)'
                                ]
                            }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                        />

                        {/* Texte animé pour la nouvelle rubrique */}
                        {currentQuestionIndex === -1 && (
                            <motion.div
                                className="text-4xl font-bold text-center text-white drop-shadow-lg"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{
                                    scale: [0.5, 1.2, 1],
                                    opacity: [0, 1, 1, 0],
                                    y: [-50, 0, 0, 50]
                                }}
                                transition={{
                                    duration: 1.5,
                                    times: [0, 0.3, 0.8, 1]
                                }}
                            >
                                NOUVELLE RUBRIQUE!
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header de la rubrique avec animation améliorée */}
            <motion.div
                className="flex items-start justify-between mb-6 relative"
                key={`rubrique-${currentRubriqueIndex}`}
                initial={{ opacity: 0, y: -100, rotateX: 90 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        delay: isTransitioning ? 0.8 : 0
                    }
                }}
                exit={{ opacity: 0, y: 100, rotateX: -90 }}
            >
                <div className="relative z-10">
                    <motion.div
                        className="absolute -left-4 -top-4 h-16 w-16 bg-yellow-400/20 rounded-full blur-xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    <h2 className="text-3xl font-bold text-yellow-400 flex items-center gap-3 relative">
                        <motion.div
                            animate={{
                                rotate: [0, 20, -20, 0],
                                scale: [1, 1.3, 1],
                                transition: {
                                    repeat: Infinity,
                                    duration: 4,
                                    ease: "easeInOut"
                                }
                            }}
                        >
                            <Star className="h-8 w-8" fill="currentColor" />
                        </motion.div>
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: 1,
                                x: 0,
                                transition: { delay: isTransitioning ? 0.9 : 0.2 }
                            }}
                        >
                            {currentRubrique.title}
                        </motion.span>
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{
                                scale: 1,
                                transition: {
                                    delay: isTransitioning ? 1.0 : 0.3,
                                    type: "spring"
                                }
                            }}
                            className="ml-2 text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full"
                        >
                            NOUVEAU!
                        </motion.span>
                    </h2>

                    <motion.p
                        className="text-white/90 mt-2 text-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            transition: {
                                delay: isTransitioning ? 1.1 : 0.4
                            }
                        }}
                    >
                        {currentRubrique.description}
                    </motion.p>

                    {currentRubrique.restrictions && (
                        <motion.p
                            className="text-sm text-red-400 mt-2"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: 1,
                                transition: { delay: isTransitioning ? 1.2 : 0.5 }
                            }}
                        >
                            ⚠️ {currentRubrique.restrictions}
                        </motion.p>
                    )}
                </div>

                <motion.span
                    className="text-sm bg-yellow-400/20 text-yellow-400 px-3 py-1.5 rounded-full flex items-center gap-1 relative z-10"
                    initial={{ scale: 0 }}
                    animate={{
                        scale: 1,
                        transition: {
                            type: "spring",
                            delay: isTransitioning ? 1.3 : 0.6,
                            stiffness: 500
                        }
                    }}
                >
                    <Sparkles className="h-4 w-4" />
                    {currentRubriqueIndex + 1}/{rubriques.length}
                </motion.span>
            </motion.div>

            <AnimatePresence mode="wait">
                {!showQuestion ? (
                    // Bouton "Commencer la rubrique" avec animation spectaculaire
                    <motion.div
                        key="initial"
                        className="flex justify-center items-center h-40 relative"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            transition: {
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                                delay: isTransitioning ? 1.4 : 0
                            }
                        }}
                        exit={{ opacity: 0, scale: 0.5 }}
                    >
                        {/* Effet de halo pulsé */}
                        <motion.div
                            className="absolute inset-0 rounded-2xl bg-yellow-400/10 pointer-events-none"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: [0.8, 1.3, 0.8],
                                opacity: [0.2, 0.5, 0.2],
                                transition: {
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }
                            }}
                        />

                        <motion.button
                            whileHover={{
                                scale: 1.1,
                                boxShadow: "0 0 30px rgba(255, 222, 89, 0.7)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRevealQuestion}
                            className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 py-4 px-8 rounded-xl font-bold text-xl flex items-center gap-3 relative overflow-hidden z-10 shadow-lg"
                            initial={{ rotate: -5, y: 20 }}
                            animate={{
                                rotate: [0, -5, 5, 0],
                                y: 0,
                                transition: {
                                    rotate: {
                                        repeat: Infinity,
                                        duration: 4
                                    },
                                    y: {
                                        type: "spring",
                                        stiffness: 300
                                    }
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
                                <ChevronRight className="h-7 w-7" />
                            </motion.span>
                            <span>LANCER LA RUBRIQUE</span>
                            <motion.div
                                className="absolute inset-0 bg-white/30"
                                initial={{ x: "-100%" }}
                                animate={{
                                    x: "100%",
                                    transition: {
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
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
                                delay: isTransitioning ? 0.8 : 0
                            }
                        }}
                        exit={{ opacity: 0, y: -50 }}
                        className="space-y-8"
                    >
                        {currentQuestion && isIdentOrFlag ? (
                            <IdentificationQuestion
                                question={currentQuestion}
                                teams={teams}
                                onFinish={handleNextQuestion}
                            />
                        ) : (
                            <>
                                {/* Affichage de la question avec animations améliorées */}
                                <motion.div
                                    className="glass-effect-inner p-6 rounded-xl border-2 border-yellow-400/30 relative overflow-hidden shadow-lg"
                                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 20,
                                            delay: isTransitioning ? 0.9 : 0.2
                                        }
                                    }}
                                    whileHover={{
                                        y: -5,
                                        boxShadow: "0 15px 30px rgba(255, 222, 89, 0.3)"
                                    }}
                                >
                                    {/* Barre de dégradé animée */}
                                    <motion.div
                                        className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500"
                                        initial={{ backgroundPosition: "0% 50%" }}
                                        animate={{
                                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                    />

                                    <div className="flex justify-between items-start mb-4">
                                        <motion.h3
                                            className="text-2xl font-bold text-yellow-400"
                                            initial={{ opacity: 0 }}
                                            animate={{
                                                opacity: 1,
                                                transition: { delay: isTransitioning ? 1.0 : 0.3 }
                                            }}
                                        >
                                            Question {currentQuestionIndex + 1}/{currentRubrique.questions.length}
                                        </motion.h3>

                                        <motion.div
                                            className="text-sm bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full"
                                            initial={{ scale: 0 }}
                                            animate={{
                                                scale: 1,
                                                transition: {
                                                    delay: isTransitioning ? 1.1 : 0.4,
                                                    type: "spring"
                                                }
                                            }}
                                        >
                                            {currentQuestion.type === "multiple" ? "Plusieurs réponses" : "Une seule réponse"}
                                        </motion.div>
                                    </div>

                                    <motion.p
                                        className="text-white text-xl font-medium mt-4 leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        animate={{
                                            opacity: 1,
                                            transition: {
                                                delay: isTransitioning ? 1.2 : 0.5
                                            }
                                        }}
                                    >
                                        {currentQuestion.text}
                                    </motion.p>

                                    {currentQuestion.hint && (
                                        <motion.div
                                            className="mt-4 p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20 flex items-start gap-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                transition: {
                                                    delay: isTransitioning ? 1.3 : 0.6
                                                }
                                            }}
                                        >
                                            <motion.span
                                                animate={{
                                                    rotate: [0, 20, -20, 0],
                                                    transition: {
                                                        repeat: Infinity,
                                                        duration: 3,
                                                        ease: "easeInOut"
                                                    }
                                                }}
                                                className="text-yellow-400 text-xl"
                                            >
                                                💡
                                            </motion.span>
                                            <div>
                                                <p className="text-xs text-yellow-400/70 uppercase font-semibold">Indice</p>
                                                <p className="text-yellow-400">{currentQuestion.hint}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>

                                <AnimatePresence>
                                    {!showAnswers ? (
                                        <motion.button
                                            key="show-answers-btn"
                                            whileHover={{
                                                scale: 1.05,
                                                boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)"
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleRevealAnswers}
                                            className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 text-white py-4 rounded-xl font-bold text-xl relative overflow-hidden shadow-lg"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                transition: {
                                                    delay: isTransitioning ? 1.4 : 0.3
                                                }
                                            }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                <Sparkles className="h-5 w-5" />
                                                RÉVÉLER LES RÉPONSES
                                            </span>
                                            <motion.div
                                                className="absolute inset-0 bg-white/30"
                                                initial={{ x: "-100%" }}
                                                animate={{
                                                    x: "100%",
                                                    transition: {
                                                        duration: 2.5,
                                                        repeat: Infinity
                                                    }
                                                }}
                                            />

                                            {/* Effet de halo pulsé */}
                                            <motion.div
                                                className="absolute inset-0 rounded-xl border-2 border-blue-400/30 pointer-events-none"
                                                initial={{ scale: 1, opacity: 0 }}
                                                animate={{
                                                    scale: 1.3,
                                                    opacity: [0, 0.4, 0],
                                                    transition: {
                                                        duration: 2.5,
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
                                                    delay: isTransitioning ? 0.8 : 0
                                                },
                                            }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            <motion.h4
                                                className="text-xl font-bold text-yellow-400 flex items-center gap-2"
                                                initial={{ x: -20 }}
                                                animate={{
                                                    x: 0,
                                                    transition: { delay: isTransitioning ? 0.9 : 0.1 }
                                                }}
                                            >
                                                <Sparkles className="h-5 w-5" />
                                                RÉPONSES :
                                            </motion.h4>

                                            <div className="grid grid-cols-1 gap-3">
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
                                                                delay: isTransitioning ? 1.0 + index * 0.1 : index * 0.1
                                                            },
                                                        }}
                                                        whileHover={{
                                                            scale: 1.03,
                                                            y: -3,
                                                            boxShadow: answer.isCorrect
                                                                ? "0 5px 15px rgba(74, 222, 128, 0.4)"
                                                                : "0 5px 15px rgba(248, 113, 113, 0.4)"
                                                        }}
                                                        className={`p-4 rounded-xl border-3 ${
                                                            answer.isCorrect
                                                                ? "border-green-500 bg-gradient-to-br from-green-500/10 to-green-600/10 hover:shadow-lg hover:shadow-green-500/30"
                                                                : "border-red-500 bg-gradient-to-br from-red-500/10 to-red-600/10 hover:shadow-lg hover:shadow-red-500/30"
                                                        } transition-all duration-300`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {answer.isCorrect ? (
                                                                <motion.div
                                                                    animate={{
                                                                        scale: [1, 1.2, 1],
                                                                        rotate: [0, 10, -10, 0],
                                                                        transition: {
                                                                            repeat: 1,
                                                                            duration: 0.6
                                                                        }
                                                                    }}
                                                                    className="flex-shrink-0 mt-1"
                                                                >
                                                                    <Check className="h-6 w-6 text-green-400" />
                                                                </motion.div>
                                                            ) : (
                                                                <span className="h-6 w-6 text-red-400 flex-shrink-0 mt-1">✕</span>
                                                            )}
                                                            <p className="text-white text-lg">{answer.text}</p>
                                                        </div>

                                                        {answer.isCorrect && currentQuestion.solution && (
                                                            <motion.div
                                                                className="mt-3 p-2 bg-green-500/10 rounded border border-green-500/20 text-green-400 text-sm"
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    height: "auto",
                                                                    transition: { delay: 0.3 }
                                                                }}
                                                            >
                                                                <p className="font-semibold">Explication :</p>
                                                                <p>{currentQuestion.solution}</p>
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}

                        {/* Bouton suivant avec animation améliorée */}
                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 0 30px rgba(255, 222, 89, 0.6)"
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNextQuestion}
                            className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 py-4 rounded-xl font-bold text-xl mt-6 relative overflow-hidden shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                    delay: isTransitioning ? 1.5 : 0.2
                                }
                            }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {currentQuestionIndex < currentRubrique.questions.length - 1
                                    ? (
                                        <>
                                            QUESTION SUIVANTE
                                            <motion.span
                                                animate={{
                                                    x: [0, 5, 0],
                                                    transition: {
                                                        repeat: Infinity,
                                                        duration: 1.5
                                                    }
                                                }}
                                            >
                                                →
                                            </motion.span>
                                        </>
                                    )
                                    : (
                                        <>
                                            RUBRIQUE SUIVANTE
                                            <motion.span
                                                animate={{
                                                    x: [0, 5, 0],
                                                    transition: {
                                                        repeat: Infinity,
                                                        duration: 1.5
                                                    }
                                                }}
                                            >
                                                →
                                            </motion.span>
                                        </>
                                    )}
                            </span>
                            <motion.div
                                className="absolute inset-0 bg-white/30"
                                initial={{ x: "-100%" }}
                                animate={{
                                    x: "100%",
                                    transition: {
                                        duration: 2.5,
                                        repeat: Infinity
                                    }
                                }}
                            />

                            {/* Effet de halo pulsé */}
                            <motion.div
                                className="absolute inset-0 rounded-xl border-2 border-yellow-400/30 pointer-events-none"
                                initial={{ scale: 1, opacity: 0 }}
                                animate={{
                                    scale: 1.3,
                                    opacity: [0, 0.4, 0],
                                    transition: {
                                        duration: 2.5,
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