// src/components/MatchIntro.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Confetti from 'react-confetti';
import canvasConfetti from 'canvas-confetti';

interface Player {
    id: string;
    name: string;
    number?: number;
    position?: string;
    photo?: string;
    stats?: {
        matches?: number;
        goals?: number;
        assists?: number;
    };
}

interface TeamIntro {
    id: string;
    name: string;
    color: string;
    secondaryColor?: string;
    logo?: string;
    players: Player[];
}
// Ajoute ces deux lignes dans l'interface
interface Person {
    name: string;
    photo: string;
}
interface MatchIntroProps {
    teams: TeamIntro[];
    presenter: Person;
    organizer: Person;
    duration?: number;
    onEnd: () => void;
    matchTitle?: string;
}


// Nouveaux variants d'animation
const titleVariants: Variants = {
    hidden: { opacity: 0, y: -100 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 1.5,
            ease: [0.16, 1, 0.3, 1]
        }
    },
    exit: {
        opacity: 0,
        y: -100,
        transition: { duration: 0.8 }
    }
};

const teamIntroVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.4,
            duration: 1,
            type: 'spring',
            stiffness: 100,
            damping: 10
        }
    }),
    exit: { opacity: 0 }
};

const teamHeaderVariants: Variants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: "backOut"
        }
    },
    exit: { opacity: 0, y: -50 }
};

const playerCardVariants: Variants = {
    hidden: { opacity: 0, y: 100, rotateX: -90, scale: 0.8 },
    visible: {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
        }
    },
    exit: { opacity: 0, scale: 0.9 }
};

const playerSlideVariants: Variants = {
    hidden: (custom: { direction: number }) => ({
        x: custom.direction * 100,
        opacity: 0
    }),
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: "circOut"
        }
    },
    exit: (custom: { direction: number }) => ({
        x: custom.direction * -100,
        opacity: 0,
        transition: {
            duration: 0.4
        }
    })
};

const statItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: 0.5 + i * 0.15,
            duration: 0.6
        }
    })
};

const photoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, x: -50 },
    visible: {
        opacity: 1,
        scale: 1,
        x: 0,
        transition: {
            delay: 0.3,
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

const counterVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "backOut"
        }
    }
};

export default function MatchIntro({
                                       teams,
                                       duration = 15000,
                                       presenter,       // ← ajouté
                                       organizer,       // ← ajouté
                                       onEnd,
                                       matchTitle = "GRANDE FINALE"
                                   }: MatchIntroProps) {
    const [phase, setPhase] = useState<'title' | 'teams' | 'teamIntro' | 'presenter' | 'organizer' |  'players' | 'exit'>('title');
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [showPlayerStats, setShowPlayerStats] = useState(false);
    const [showTeamHeader, setShowTeamHeader] = useState(true);
    const animationRef = useRef<NodeJS.Timeout>();
    const playersIntervalRef = useRef<NodeJS.Timeout>();
    const teamTimeoutRef = useRef<NodeJS.Timeout>();

    // Effets sonores (à implémenter)
    const playSound = (type: 'intro' | 'team' | 'player' | 'finale') => {
        console.log(`Playing ${type} sound`);
    };

    // Lancement des confettis directionnels
    const fireConfetti = (angle: number) => {
        canvasConfetti({
            particleCount: 150,
            angle,
            spread: 45,
            origin: { x: angle === 60 ? 0 : 1, y: 0.6 },
            colors: [teams[angle === 60 ? 0 : 1].color, '#ffffff']
        });
    };

    // Présenter un joueur spécifique
    const presentPlayer = (teamIdx: number, playerIdx: number) => {
        setCurrentTeamIndex(teamIdx);
        setCurrentPlayerIndex(playerIdx);
        setShowPlayerStats(false);
        playSound('player');
        fireConfetti(teamIdx === 0 ? 60 : 120);

        setTimeout(() => {
            setShowPlayerStats(true);
        }, 500);
    };

    // Démarrer la présentation d'une équipe
    const startTeamPresentation = (teamIdx: number) => {
        setCurrentTeamIndex(teamIdx);
        setPhase('teamIntro');
        playSound('team');

        // Montrer l'en-tête de l'équipe pendant 2 secondes
        setShowTeamHeader(true);

        teamTimeoutRef.current = setTimeout(() => {
            setShowTeamHeader(false);
            startPlayersPresentation(teamIdx);
        }, 2000);
    };

    // Démarrer la présentation des joueurs d'une équipe
    const startPlayersPresentation = (teamIdx: number) => {
        setPhase('players');
        let playerIdx = 0;

        // Présenter le premier joueur immédiatement
        presentPlayer(teamIdx, playerIdx);

        // Puis passer aux suivants toutes les 1.8 secondes
        playersIntervalRef.current = setInterval(() => {
            playerIdx++;

            if (playerIdx >= teams[teamIdx].players.length) {
                // Fin de cette équipe
                clearInterval(playersIntervalRef.current!);

                // S'il reste une équipe, on passe à la suivante
                if (teamIdx < teams.length - 1) {
                    setTimeout(() => startTeamPresentation(teamIdx + 1), 1000);
                } else {
                    // Dernière équipe : on enchaîne sur le présentateur
                    setTimeout(() => {
                        setPhase('presenter');
                        playSound('player'); // ou un jingle dédié

                        // Après 4s, on passe à l'organisateur
                        setTimeout(() => {
                            setPhase('organizer');
                            playSound('team'); // ou un autre jingle
                        }, 4000);
                    }, 1000);
                }
                return;
            }

            presentPlayer(teamIdx, playerIdx);
        }, 1800);
    };

    useEffect(() => {
        // Son d'intro dès le montage
        playSound('intro');

        // Phase 1: Titre → équipes
        const t1 = setTimeout(() => {
            setPhase('teams');
            fireConfetti(60);
            fireConfetti(120);
        }, 3000);

        // Phase 2: Équipes → présentation de la première équipe
        const t2 = setTimeout(() => {
            startTeamPresentation(0);
        }, 6000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearInterval(playersIntervalRef.current!);
            clearTimeout(teamTimeoutRef.current!);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50 overflow-hidden">
            {/* Confettis continus */}
            <Confetti
                recycle={true}
                numberOfPieces={200}
                gravity={0.2}
                colors={[teams[0].color, teams[1].color, '#ffffff']}
            />

            {/* Phase 1: Titre */}
            <AnimatePresence>
                {phase === 'title' && (
                    <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center"
                        variants={titleVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="relative">
                            {/* Effet de halo */}
                            <motion.div
                                className="absolute -inset-12 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full blur-3xl opacity-30"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 0.3 }}
                                transition={{ duration: 1.5 }}
                            />

                            {/* Titre principal */}
                            <motion.h1
                                className="relative text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 uppercase tracking-wider text-center"
                            >
                                {matchTitle}
                            </motion.h1>

                            {/* Sous-titre */}
                            <motion.p
                                className="relative mt-6 text-2xl text-white/80 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                Le choc des titans
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Phase 2: Présentation des équipes */}
            <AnimatePresence>
                {phase === 'teams' && (
                    <motion.div
                        className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-6xl px-4"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {teams.map((team, teamIndex) => (
                            <motion.div
                                key={team.id}
                                className="flex-1 flex flex-col items-center"
                                custom={teamIndex}
                                variants={teamIntroVariants}
                            >
                                {/* Logo d'équipe */}
                                <div className="relative mb-6">
                                    <motion.div
                                        className="absolute -inset-4 rounded-full blur-xl opacity-60"
                                        style={{ backgroundColor: team.color }}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                    />
                                    <div className="relative w-40 h-40 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border-4 border-white/20 shadow-2xl">
                                        {team.logo ? (
                                            <img src={team.logo} alt={team.name} className="w-3/4 h-3/4 object-contain" />
                                        ) : (
                                            <span className="text-4xl font-bold text-white">{team.name.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Nom d'équipe */}
                                <motion.h2
                                    className="text-4xl font-bold text-center text-white mb-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    {team.name}
                                </motion.h2>

                                {/* Nombre de joueurs */}
                                <motion.p
                                    className="text-xl text-white/70"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                >
                                    {team.players.length} champions
                                </motion.p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Phase 3a: En-tête d'équipe avant présentation des joueurs */}
            <AnimatePresence>
                {phase === 'teamIntro' && showTeamHeader && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="text-center"
                            variants={teamHeaderVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.div
                                className="text-sm font-semibold text-white/70 mb-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                PRÉSENTATION DES JOUEURS
                            </motion.div>
                            <motion.h2
                                className="text-5xl md:text-7xl font-bold text-white mb-4"
                                style={{ color: teams[currentTeamIndex].color }}
                            >
                                {teams[currentTeamIndex].name}
                            </motion.h2>
                            <motion.div
                                className="text-xl text-white/70"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {teams[currentTeamIndex].players.length} joueurs à découvrir
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Phase 3b: Présentation des joueurs */}
            <AnimatePresence mode="wait">
                {(phase === 'players' || phase === 'teamIntro') && !showTeamHeader && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={`player-${currentTeamIndex}-${currentPlayerIndex}`}
                    >
                        {/* Fond coloré */}
                        <motion.div
                            className="absolute inset-0 opacity-70"
                            style={{
                                backgroundColor: teams[currentTeamIndex].color,
                                backgroundImage: `radial-gradient(${teams[currentTeamIndex].secondaryColor || teams[currentTeamIndex].color} 20%, transparent 70%)`
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            exit={{ opacity: 0 }}
                        />

                        {/* Contenu du joueur */}
                        <div className="relative w-full max-w-4xl px-4">
                            {/* Compteur joueur */}
                            <motion.div
                                className="absolute -top-10 left-0 right-0 flex justify-center"
                                variants={counterVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <div className="bg-black/50 px-4 py-2 rounded-full text-white text-sm font-semibold">
                                    Joueur {currentPlayerIndex + 1}/{teams[currentTeamIndex].players.length} • Équipe {currentTeamIndex + 1}/{teams.length}
                                </div>
                            </motion.div>

                            <motion.div
                                className="bg-black/70 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl"
                                variants={playerCardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                custom={{ direction: currentPlayerIndex % 2 === 0 ? 1 : -1 }}
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Photo du joueur */}
                                    <motion.div
                                        className="relative w-full md:w-1/3 h-64 md:h-auto bg-gradient-to-b from-white/10 to-white/5"
                                        variants={photoVariants}
                                    >
                                        {teams[currentTeamIndex].players[currentPlayerIndex].photo ? (
                                            <img
                                                src={teams[currentTeamIndex].players[currentPlayerIndex].photo}
                                                alt={teams[currentTeamIndex].players[currentPlayerIndex].name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-8xl font-bold text-white/30">
                                                    {teams[currentTeamIndex].players[currentPlayerIndex].number || '?'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
                                    </motion.div>

                                    {/* Infos du joueur */}
                                    <div className="w-full md:w-2/3 p-8 flex flex-col justify-center">
                                        <motion.div
                                            className="mb-6"
                                            variants={playerSlideVariants}
                                            custom={{ direction: -1 }}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <div className="text-sm font-semibold text-white/70 mb-1">
                                                {teams[currentTeamIndex].name}
                                            </div>
                                            <h3 className="text-4xl font-bold text-white mb-2">
                                                {teams[currentTeamIndex].players[currentPlayerIndex].name}
                                            </h3>
                                            <div className="flex gap-4">
                                                {teams[currentTeamIndex].players[currentPlayerIndex].number && (
                                                    <span className="px-3 py-1 bg-white/10 rounded-full text-white">
                                                        #{teams[currentTeamIndex].players[currentPlayerIndex].number}
                                                    </span>
                                                )}
                                                {teams[currentTeamIndex].players[currentPlayerIndex].position && (
                                                    <span className="px-3 py-1 bg-white/10 rounded-full text-white">
                                                        {teams[currentTeamIndex].players[currentPlayerIndex].position}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Statistiques */}
                                        {teams[currentTeamIndex].players[currentPlayerIndex].stats && (
                                            <motion.div
                                                className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4"
                                                initial="hidden"
                                                animate={showPlayerStats ? "visible" : "hidden"}
                                            >
                                                {Object.entries(teams[currentTeamIndex].players[currentPlayerIndex].stats || {}).map(([key, value], i) => (
                                                    <motion.div
                                                        key={key}
                                                        className="bg-white/5 rounded-lg p-3"
                                                        custom={i}
                                                        variants={statItemVariants}
                                                    >
                                                        <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                                                            {key}
                                                        </div>
                                                        <div className="text-2xl font-bold text-white">
                                                            {value}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Présentateur */}
            <AnimatePresence>
                {phase === 'presenter' && (
                    <motion.div className="absolute inset-0 flex items-center justify-center bg-black/90">
                        <div className="text-center p-8">
                            <img src={presenter.photo} alt={presenter.name}
                                 className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"/>
                            <h2 className="text-4xl font-bold text-white">{presenter.name}</h2>
                            <p className="mt-2 text-white/70">« Bienvenue ! »</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Organisateur */}
            <AnimatePresence>
                {phase === 'organizer' && (
                    <motion.div className="absolute inset-0 flex items-center justify-center bg-black/90">
                        <div className="text-center p-8">
                            <img src={organizer.photo} alt={organizer.name}
                                 className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"/>
                            <h2 className="text-4xl font-bold text-white">{organizer.name}</h2>
                            <button
                                onClick={onEnd}
                                className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full"
                            >
                                Lancer le match
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}