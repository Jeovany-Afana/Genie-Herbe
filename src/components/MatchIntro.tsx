// src/components/MatchIntro.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Confetti from 'react-confetti';
import canvasConfetti from 'canvas-confetti';
import  { Partner, JuryMember } from '../App.tsx'

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
    jury: JuryMember[];          // ← NEW
    partners: Partner[];         // ← NEW
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
                                       organizer,
                                       jury = [],          //  ←–––– ICI
                                       partners = [],      //  ←–––– ET ICI// ← ajouté
                                       onEnd,
                                       matchTitle = "GRANDE FINALE"
                                   }: MatchIntroProps) {
    const [phase, setPhase] = useState<'title' | 'teams' | 'teamIntro' | 'presenter' | 'jury' | 'partners' | 'organizer' |  'players' | 'exit'>('title');
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [showPlayerStats, setShowPlayerStats] = useState(false);
    const [showTeamHeader, setShowTeamHeader] = useState(true);
    const playersIntervalRef = useRef<NodeJS.Timeout>();
    const teamTimeoutRef = useRef<NodeJS.Timeout>();
    const [ setFlash]   = useState(false);
    const [currentJuryIndex,    setCurrentJuryIndex]    = useState(0);   // ← NEW
    const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0);   // ← NEW
    // 1.  Nouvel état
    const [shownPlayers, setShownPlayers] = useState<Player[]>([]);


    // -------------  state supplémentaires -------------
    const [showRoster, setShowRoster] = useState(false);   // afficher les deux équipes sous l’organisateur

// ------------- variants -------------
    // même fichier  MatchIntro.tsx
    const organizerCardVariants: Variants = {
        center: {                    // démarre plein centre
            y: '-50vh',
            scale: 1,
            transition: { duration:.8, ease:'backOut' }
        },
        header: {                    // finit tout en haut, centré horizontalement
            y: 0,
            scale: .85,
            transition: { duration:.8, ease:'backInOut' }
        }
    };

    const juryCardVariants: Variants = {
        hidden : { opacity: 0, scale: 0.8, y: 50 },
        visible: {
            opacity: 1,
            scale : 1,
            y     : 0,
            transition: { duration: 0.6, type: 'spring', stiffness: 120 }
        },
        exit   : { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.4 }}
    };




    // déclenche des éclairs aléatoires tant que le roster est visible
    useEffect(() => {
        if (!showRoster) return;           // on ne fait rien tant que le roster n’est pas affiché

        const makeFlash = () => {
            setFlash(true);                  // on déclenche LightningFlash
            setTimeout(() => setFlash(false), 250);   // on l'éteint vite pour le clignotement
        };

        const id = setInterval(() => {
            makeFlash();                     // petit éclair
            if (Math.random() > .6) setTimeout(makeFlash, 300); // parfois un double‐éclair
        }, 4000 + Math.random() * 3000);   // toutes les 4-7 s

        return () => clearInterval(id);    // nettoyage si on quitte le composant
    }, [showRoster]);


    /* ─── JURY : défilement séquentiel ─── */
    useEffect(() => {
        if (phase !== 'jury') return;

        setCurrentJuryIndex(0);               // on repart du premier
        const id = setInterval(() => {
            setCurrentJuryIndex(prev => {
                if (prev < jury.length - 1) return prev + 1;

                // dernier membre : on attend 2 s puis on passe aux partenaires
                clearInterval(id);
                setTimeout(() => {
                    setPhase('partners');
                    setCurrentPartnerIndex(0);
                }, 2000);
                return prev;
            });
        }, 3500);                             // ← vitesse : 3,5 s entre chaque carte

        return () => clearInterval(id);
    }, [phase, jury.length]);




    // ---- SONS ---------------------------------------------------------------
// On charge les sons une seule fois au montage du composant
    const audioRef = useRef<Record<'audio_nicki' | 'clue-reveal' | 'intro1' | 'intro2', HTMLAudioElement>>(
        {} as any
    );

    useEffect(() => {
        audioRef.current = {
            player: new Audio('/sounds/morose.mp3'),
            intro:  new Audio('/sounds/audio_nicki.mp3'),
            team:   new Audio('/sounds/intro2.mp3'),
            finale: new Audio('/sounds/clue-reveal.mp3'),


        };

        // Volume global (adapte à ton goût)
        Object.values(audioRef.current).forEach(a => (a.volume = 0.6));

        // On lance la musique d’ambiance immédiatement, en boucle
        audioRef.current.player.loop = true;
        audioRef.current.player.play().catch(() => {
            /* Si l'autoplay est bloqué, elle démarrera au premier clic utilisateur. */
        });

        return () => {
            // Nettoyage : on stoppe tout pour ne pas laisser d’audio fantôme
            Object.values(audioRef.current).forEach(a => {
                a.pause();
                a.currentTime = 0;
            });
        };
    }, []);


    // Effets sonores (à implémenter)
    const playSound = (type: 'audio_nicki' | 'intro1' | 'player' | 'finale') => {
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
    /**  Affiche un joueur : ajoute la carte au tableau des joueurs déjà montrés  */
    const presentPlayer = (teamIdx: number, playerIdx: number) => {
        setCurrentTeamIndex(teamIdx);
        setCurrentPlayerIndex(playerIdx);

        // ► on empile la nouvelle carte
        const newPlayer = teams[teamIdx].players[playerIdx];
        setShownPlayers(prev => [...prev, newPlayer]);

        setShowPlayerStats(false);
        fireConfetti(teamIdx === 0 ? 60 : 120);

        // petite pause avant d’afficher ses stats (uniquement la dernière carte)
        setTimeout(() => setShowPlayerStats(true), 500);
    };


    // Démarrer la présentation d'une équipe
    const startTeamPresentation = (teamIdx: number) => {
        setCurrentTeamIndex(teamIdx);
        setPhase('teamIntro');
        playSound('audio_nicki coupe');

        // Montrer l'en-tête de l'équipe pendant 2 secondes
        setShowTeamHeader(true);

        teamTimeoutRef.current = setTimeout(() => {
            setShowTeamHeader(false);
            startPlayersPresentation(teamIdx);
        }, 2000);
    };

    // Démarrer la présentation des joueurs d'une équipe
    /**  Lance la présentation séquentielle des joueurs d’une équipe  */
    const startPlayersPresentation = (teamIdx: number) => {
        setPhase('players');
        setShownPlayers([]);                // ← on vide la grille pour la nouvelle équipe
        let playerIdx = 0;

        presentPlayer(teamIdx, playerIdx);  // premier joueur immédiatement

        // ensuite, un joueur toutes les 4 s
        playersIntervalRef.current = setInterval(() => {
            playerIdx++;

            if (playerIdx >= teams[teamIdx].players.length) {
                // ─── fin de l’équipe ───
                clearInterval(playersIntervalRef.current!);

                if (teamIdx < teams.length - 1) {
                    /* encore une équipe à présenter */
                    setTimeout(() => startTeamPresentation(teamIdx + 1), 1000);
                } else {
                    /* dernière équipe → présentateur puis organisateur */
                    setTimeout(() => {
                        setPhase('presenter');
                        playSound('intro1');

                        setTimeout(() => {
                            setPhase('organizer');
                            playSound('intro1');
                        }, 4000); // durée d’affichage du présentateur
                    }, 1000);
                }
                return;
            }

            /* joueur suivant */
            presentPlayer(teamIdx, playerIdx);
        }, 4000);
    };


    // écoute la fin du jury
    useEffect(() => {
        if (phase === 'jury' && currentJuryIndex >= jury.length) {
            setTimeout(() => {
                setPhase('partners');
                setCurrentPartnerIndex(0);
            }, 1000);
        }
    }, [phase, currentJuryIndex, jury.length]);


    useEffect(() => {
        // Son d'intro dès le montage
        playSound('audio_nicki');

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

            {/* ─── Phase 3b : présentation / rangement des joueurs ─── */}
            <AnimatePresence mode="popLayout">
                {phase === 'players' && (
                    <motion.div
                        key={`players-grid-${currentTeamIndex}`}
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Fond coloré */}
                        <motion.div
                            className="absolute inset-0 opacity-70"
                            style={{
                                backgroundColor: teams[currentTeamIndex].color,
                                backgroundImage: `radial-gradient(${
                                    teams[currentTeamIndex].secondaryColor ||
                                    teams[currentTeamIndex].color
                                } 20%, transparent 70%)`,
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            exit={{ opacity: 0 }}
                        />

                        <div className="relative w-full max-w-6xl px-4">
                            {/* Compteur */}
                            <motion.div
                                className="absolute -top-10 left-0 right-0 flex justify-center"
                                variants={counterVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <div className="bg-black/50 px-4 py-2 rounded-full text-white text-sm font-semibold">
                                    {shownPlayers.length}/{teams[currentTeamIndex].players.length} joueurs • Équipe
                                    {currentTeamIndex + 1}/{teams.length}
                                </div>
                            </motion.div>

                            {/* Grille des cartes déjà dévoilées */}
                            <motion.div
                                layout                           // re-layout animé des cartes
                                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                            >
                                {shownPlayers.map((pl, i) => (
                                    <motion.div
                                        key={pl.id}
                                        layout
                                        variants={playerCardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="bg-black/70 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl"
                                    >
                                        <div className="flex flex-col">
                                            {/* Photo */}
                                            <motion.div
                                                className="relative w-full aspect-[3/4] bg-gradient-to-b from-white/10 to-white/5 overflow-hidden"
                                                variants={photoVariants}
                                            >
                                                {pl.photo ? (
                                                    <img
                                                        src={pl.photo}
                                                        alt={pl.name}
                                                        className="absolute inset-0 w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-8xl font-bold text-white/30">
                        {pl.number ?? '?'}
                      </span>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
                                            </motion.div>

                                            {/* Infos joueur */}
                                            <div className="p-6 flex flex-col justify-center">
                                                <h3 className="text-2xl font-bold text-white mb-1">{pl.name}</h3>
                                                <div className="flex gap-3 mb-3">
                                                    {pl.number && (
                                                        <span className="px-3 py-1 bg-white/10 rounded-full text-white">#{pl.number}</span>
                                                    )}
                                                    {pl.position && (
                                                        <span className="px-3 py-1 bg-white/10 rounded-full text-white">{pl.position}</span>
                                                    )}
                                                </div>

                                                {/* Statistiques uniquement pour la DERNIÈRE carte + après le petit délai */}
                                                {i === shownPlayers.length - 1 && showPlayerStats && pl.stats && (
                                                    <motion.div
                                                        className="grid grid-cols-2 gap-4 mt-2"
                                                        initial="hidden"
                                                        animate="visible"
                                                    >
                                                        {Object.entries(pl.stats).map(([k, v], idx) => (
                                                            <motion.div
                                                                key={k}
                                                                custom={idx}
                                                                variants={statItemVariants}
                                                                className="bg-white/5 rounded-lg p-3"
                                                            >
                                                                <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                                                                    {k}
                                                                </div>
                                                                <div className="text-2xl font-bold text-white">{v}</div>
                                                            </motion.div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
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
                                 className="w-96 h-96 rounded-full mx-auto mb-4 object-cover"/>
                            <h2 className="text-4xl font-bold text-white">{presenter.name}</h2>
                            <p className="mt-2 text-white/70">« Bienvenue ! »</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Organisateur */}
            /* ---------------- ORGANIZER phase ---------------- */
            {/* ─── ORGANIZER phase ─── */}
            <AnimatePresence>
                {phase === 'organizer' && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center overflow-y-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Effet de particules en arrière-plan */}
                        <div className="absolute inset-0 opacity-20">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full bg-white"
                                    style={{
                                        width : `${Math.random() * 5 + 2}px`,
                                        height: `${Math.random() * 5 + 2}px`,
                                        left  : `${Math.random() * 100}%`,
                                        top   : `${Math.random() * 100}%`,
                                    }}
                                    animate={{
                                        y      : [0, (Math.random() - 0.5) * 40],
                                        x      : [0, (Math.random() - 0.5) * 20],
                                        opacity: [0.2, 0.8, 0.2],
                                    }}
                                    transition={{
                                        duration: Math.random() * 10 + 5,
                                        repeat  : Infinity,
                                        repeatType: 'reverse',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Carte organisateur */}
                        <motion.div
                            variants={organizerCardVariants}
                            initial="center"
                            animate="header"
                            onAnimationComplete={() => setShowRoster(true)}
                            className="w-full flex flex-col items-center pt-12 relative z-10"
                        >
                            <div className="relative">
                                {/* Halo */}
                                <motion.div
                                    className="absolute -inset-4 rounded-full"
                                    style={{ background: `radial-gradient(circle, ${teams[0].color} 0%, transparent 70%)` }}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 0.3, scale: 1.2 }}
                                    transition={{ repeat: Infinity, repeatType: 'reverse', duration: 3 }}
                                />

                                {/* Photo organisateur */}
                                <motion.img
                                    src={organizer.photo}
                                    alt={organizer.name}
                                    className="w-52 h-52 md:w-64 md:h-64 rounded-full object-cover mb-3 relative z-10 border-4 border-white/20 shadow-xl"
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                />
                            </div>

                            <motion.h2
                                className="text-4xl md:text-5xl font-bold text-white mt-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                {organizer.name}
                            </motion.h2>

                            <motion.div
                                className="px-6 py-2 bg-black/50 rounded-full mt-3 border border-white/10 backdrop-blur-sm"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <p className="text-white/80 text-sm font-medium tracking-wider">ORGANISATEUR&nbsp;DU&nbsp;MATCH</p>
                            </motion.div>
                        </motion.div>

                        {/* Rosters des équipes */}
                        {showRoster && (
                            <>
                                <motion.div
                                    className="w-full max-w-4xl mx-auto px-6 py-8"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                >
                                    <motion.h3
                                        className="text-2xl font-bold text-center mb-8 text-white/90"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Les équipes en présence
              </span>
                                    </motion.h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {teams.map((team, index) => (
                                            <motion.div
                                                key={team.id}
                                                className="bg-gradient-to-b from-white/5 to-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 shadow-lg overflow-hidden"
                                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                                            >
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center">
                                                        {team.logo && (
                                                            <img src={team.logo} alt={team.name} className="w-12 h-12 mr-3 object-contain" />
                                                        )}
                                                        <h4 className="text-xl font-bold" style={{ color: team.color }}>
                                                            {team.name}
                                                        </h4>
                                                    </div>
                                                    <span className="text-white/60 text-sm">{team.players.length} joueurs</span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    {team.players.map((player, playerIndex) => (
                                                        <motion.div
                                                            key={player.id}
                                                            className="flex flex-col items-center group"
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{
                                                                delay: 0.8 + index * 0.1 + playerIndex * 0.03,
                                                                type : 'spring',
                                                                stiffness: 300,
                                                            }}
                                                            whileHover={{ y: -5 }}
                                                        >
                                                            <div className="relative">
                                                                <img
                                                                    src={player.photo || '/images/placeholder.png'}
                                                                    alt={player.name}
                                                                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20 group-hover:border-white/50 transition-all duration-300"
                                                                />
                                                                {player.number && (
                                                                    <div
                                                                        className="absolute -bottom-1 -right-1 bg-black/80 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border border-white/20"
                                                                        style={{ color: team.color }}
                                                                    >
                                                                        {player.number}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-white text-xs mt-2 text-center font-medium truncate w-full px-1">
                          {player.name}
                        </span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* BOUTON : passer au jury */}
                                <motion.div
                                    className="w-full flex justify-center pb-12 pt-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setPhase('jury');
                                            setCurrentJuryIndex(0);
                                            playSound('intro1');
                                        }}
                                        className="px-10 py-4 rounded-full font-bold text-lg relative overflow-hidden
                         bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 shadow-lg"
                                    >
                                        Passer&nbsp;au&nbsp;jury&nbsp;&rarr;
                                    </motion.button>
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                )}

            </AnimatePresence>


            {/* ─── JURY phase ─── */}
            <AnimatePresence mode="wait">
                {phase === 'jury' && (
                    <motion.div
                        key="jury-wrapper"
                        className="absolute inset-0 flex items-center justify-center bg-black/90 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="w-full max-w-lg text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">
                                NOS&nbsp;MEMBRES&nbsp;DU&nbsp;JURY
                            </h2>

                            {/* Carte unique, centrée */}
                            <AnimatePresence mode="wait">
                                {jury[currentJuryIndex] && (
                                    <motion.div
                                        key={jury[currentJuryIndex].id}
                                        variants={juryCardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm
                         rounded-2xl p-8 shadow-2xl flex flex-col items-center"
                                    >
                                        <img
                                            src={jury[currentJuryIndex].photo || '/images/placeholder.png'}
                                            alt={jury[currentJuryIndex].name}
                                            className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover
                           border-4 border-white/20 shadow-lg mb-6"
                                        />

                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                            {jury[currentJuryIndex].name}
                                        </h3>

                                        <p className="text-white/60 text-sm">
                                            {currentJuryIndex + 1}/{jury.length}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>



                )}
            </AnimatePresence>



            


            {/* ─── PARTNERS phase ─── */}
            <AnimatePresence>
                {phase === 'partners' && partners.length > 0 && (
                    <motion.div
                        key="partner-slide"
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/** partenaire courant */}
                        <motion.div
                            initial={{ scale: 0.8, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 120 }}
                            className="max-w-lg w-full glass-effect p-8 rounded-2xl border border-white/10"
                        >
                            {partners[currentPartnerIndex].logo && (
                                <img
                                    src={partners[currentPartnerIndex].logo}
                                    alt={partners[currentPartnerIndex].name}
                                    className="h-32 mx-auto mb-6 object-contain"
                                />
                            )}
                            <h3 className="text-3xl font-bold text-white mb-4">
                                {partners[currentPartnerIndex].name}
                            </h3>

                            {partners[currentPartnerIndex].speech && (
                                <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                                    {partners[currentPartnerIndex].speech}
                                </p>
                            )}
                        </motion.div>

                        {/** boutons navigation */}
                        <div className="mt-10 flex gap-4">
                            {currentPartnerIndex < partners.length - 1 ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                        setCurrentPartnerIndex(idx => idx + 1)
                                    }
                                    className="px-6 py-3 bg-yellow-400 text-blue-900 font-semibold rounded-full shadow-lg"
                                >
                                    Partenaire suivant →
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onEnd}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-full shadow-lg"
                                >
                                    Lancer le match
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>




        </div>
    );
}