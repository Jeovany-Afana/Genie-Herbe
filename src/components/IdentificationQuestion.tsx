// src/components/IdentificationQuestion.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

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
    // Vous pouvez ajouter ici des callbacks pour la validation de la réponse, etc.
}

export const IdentificationQuestion: React.FC<IdentificationQuestionProps> = ({ question }) => {
    // On démarre avec le premier indice affiché
    const [currentClueIndex, setCurrentClueIndex] = useState(0);

    const revealNextClue = () => {
        if (question.clues && currentClueIndex < question.clues.length - 1) {
            setCurrentClueIndex(currentClueIndex + 1);
        }
    };

    const currentClue = question.clues ? question.clues[currentClueIndex] : null;

    return (
        <motion.div
            key="identification-question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Affichage du texte de la question */}
            <div className="glass-effect-inner p-4 rounded-lg border border-yellow-400/20">
                <h3 className="text-xl font-semibold text-yellow-400">Question d'identification</h3>
                <p className="text-white mt-2 text-lg">{question.text}</p>
                {question.hint && (
                    <p className="text-sm text-yellow-400 mt-2">Indice complémentaire : {question.hint}</p>
                )}
            </div>

            {/* Affichage du ou des indices */}
            {currentClue && (
                <motion.div
                    key={`clue-${currentClueIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-indigo-800 p-4 rounded-lg shadow-md text-center"
                >
                    <div className="text-2xl font-bold text-yellow-300">
                        Indice {currentClueIndex + 1} – {currentClue.points} points
                    </div>
                    <p className="text-white mt-2">{currentClue.text || "Indice vide"}</p>
                </motion.div>
            )}

            {/* Bouton pour révéler le prochain indice (si disponible) */}
            {question.clues && currentClueIndex < question.clues.length - 1 && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={revealNextClue}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold"
                >
                    Révéler l'indice suivant
                </motion.button>
            )}

            {/* Bouton pour valider la réponse (à connecter à votre logique de validation) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => console.log("Réponse validée !")} // Ici, vous intégrerez le callback de validation
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold"
            >
                J'ai trouvé !
            </motion.button>
        </motion.div>
    );
};
