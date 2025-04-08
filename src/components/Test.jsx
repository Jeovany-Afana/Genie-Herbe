// Ajoute ces nouvelles fonctions utilitaires au début du composant (avec les autres fonctions)
const triggerVictoryAnimation = (teamIndex: number) => {
    const emojis = ['🎉', '🔥', '⚡', '🏆', '✨', '👑', '💪', '🚀'];
    const teamCardRef = teamIndex === 0 ? teamACardRef : teamBCardRef;

    if (teamCardRef.current) {
        const rect = teamCardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Animation de confetti spéciale pour la victoire
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: centerX / window.innerWidth, y: centerY / window.innerHeight },
            colors: [teams[teamIndex].color]
        });

        // Crée des emojis animés
        for (let i = 0; i < 12; i++) {
            const emoji = document.createElement('div');
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.position = 'fixed';
            emoji.style.left = `${centerX - 15}px`;
            emoji.style.top = `${centerY - 15}px`;
            emoji.style.fontSize = '30px';
            emoji.style.pointerEvents = 'none';
            emoji.style.zIndex = '9999';
            emoji.style.opacity = '0';

            document.body.appendChild(emoji);

            // Animation de l'emoji
            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 3;
            const x = Math.cos(angle) * velocity;
            const y = Math.sin(angle) * velocity;

            const duration = 1500 + Math.random() * 1000;

            emoji.animate([
                { transform: 'translate(0, 0) scale(0.5)', opacity: 0 },
                { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0.1 },
                { transform: `translate(${x * 100}px, ${y * 100}px) scale(0.5)`, opacity: 0 }
            ], {
                duration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });

            // Supprime l'emoji après l'animation
            setTimeout(() => {
                emoji.remove();
            }, duration);
        }
    }
};

// Modifie la fonction updateScore pour déclencher l'animation de victoire quand une équipe prend l'avantage
const updateScore = (teamIndex: number, points: number) => {
    playButtonClick();
    const now = Date.now();
    setTeams((prevTeams) => {
        const newTeams = prevTeams.map((team, index) => {
            if (index === teamIndex) {
                const newScore = team.score + points;
                // Vérification du palier
                if (Math.floor(team.score / MILESTONE_POINTS) < Math.floor(newScore / MILESTONE_POINTS)) {
                    triggerMilestone(team.name);
                }

                // Mise à jour des statistiques des joueurs
                const updatedPlayers = team.players.map((player) =>
                    player.isActive ? { ...player, pointsScored: player.pointsScored + Math.max(0, points) } : player
                );

                // Sons
                points > 0 ? playPointsGained() : playPointsLost();

                // Animation de la carte d'équipe
                if (index === 0)
                    teamAControls.start({
                        x: [0, points > 0 ? -10 : 10, 0],
                        scale: points > 0 ? [1, 1.05, 1] : [1, 0.95, 1],
                        transition: { duration: 0.3 }
                    });
                if (index === 1)
                    teamBControls.start({
                        x: [0, points > 0 ? 10 : -10, 0],
                        scale: points > 0 ? [1, 1.05, 1] : [1, 0.95, 1],
                        transition: { duration: 0.3 }
                    });

                return {
                    ...team,
                    score: newScore,
                    lastScoreChange: points,
                    scoreUpdateTimestamp: now,
                    players: updatedPlayers
                };
            }
            return team;
        });

        // Vérifie si cette mise à jour donne l'avantage à une équipe
        const wasLeadingBefore = getWinningTeam(prevTeams);
        const isLeadingNow = getWinningTeam(newTeams);

        if (isLeadingNow !== -1 && wasLeadingBefore !== isLeadingNow) {
            triggerVictoryAnimation(isLeadingNow);
        }

        // Mise à jour de l'historique
        setHistory((prev) => [...prev, { teams: newTeams, timestamp: Date.now() }]);
        return newTeams;
    });
};

// Ajoute cette fonction utilitaire pour déterminer l'équipe en tête
const getWinningTeam = (teamsArray: Team[]) => {
    if (teamsArray[0].score > teamsArray[1].score) return 0;
    if (teamsArray[1].score > teamsArray[0].score) return 1;
    return -1; // Égalité
};

// Modifie le composant TeamCard pour ajouter un indicateur visuel de l'équipe dominante
const TeamCard = ({
                      team,
                      teamIndex,
                      controls
                  }: {
    team: Team;
    teamIndex: number;
    controls: any;
}) => {
    const isWinning = getWinningTeam(teams) === teamIndex && gamePhase === 'results';
    const isLeading = getWinningTeam(teams) === teamIndex && gamePhase === 'game';

    return (
        <motion.div
            ref={teamIndex === 0 ? teamACardRef : teamBCardRef}
            animate={controls}
            className={`w-full glass-effect rounded-xl p-6 shadow-xl border-2 flex flex-col relative ${
                isWinning ? 'border-yellow-400 animate-pulse' :
                    isLeading ? 'border-yellow-400/70' : 'border-yellow-400/30'
            }`}
            style={{
                background: `linear-gradient(to bottom right, ${team.color}20, ${team.color}10)`,
                borderColor: isWinning ? team.color : isLeading ? team.color : `${team.color}50`
            }}
        >
            {/* Indicateur de l'équipe dominante (pendant le jeu) */}
            {isLeading && gamePhase === 'game' && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 -left-3"
                >
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="text-3xl"
                    >
                        ⭐
                    </motion.div>
                </motion.div>
            )}

            {/* ... (reste du composant inchangé) ... */}
        </motion.div>
    );
};

// Modifie la fonction triggerMilestone pour une animation plus riche
const triggerMilestone = (teamName: string) => {
    setShowAlert(`Bravo ${teamName} ! ${MILESTONE_POINTS} points atteints !`);
    playMilestone();

    // Confetti spécial pour les milestones
    confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
    });

    // Ajoute des emojis qui tombent
    const emojis = ['🎯', '🏅', '🥇', '💎', '🌟', '👏'];
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const emoji = document.createElement('div');
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.position = 'fixed';
            emoji.style.left = `${Math.random() * 100}vw`;
            emoji.style.top = '-50px';
            emoji.style.fontSize = `${20 + Math.random() * 30}px`;
            emoji.style.pointerEvents = 'none';
            emoji.style.zIndex = '9999';

            document.body.appendChild(emoji);

            const animationDuration = 2000 + Math.random() * 3000;

            emoji.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight + 50}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 0.5 }
            ], {
                duration: animationDuration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });

            setTimeout(() => {
                emoji.remove();
            }, animationDuration);
        }, i * 100);
    }

    setTimeout(() => setShowAlert(''), 3000);
};

// Modifie le composant MilestoneAlert pour plus de dynamisme
const MilestoneAlert = ({ message }: { message: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
            <div className="relative">
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, -5, 5, -5, 5, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-12 py-8 rounded-2xl font-bold text-3xl shadow-2xl border-4 border-yellow-300"
                >
                    {message}
                </motion.div>
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        animate={{
                            x: Math.random() * 400 - 200,
                            y: Math.random() * 400 - 100,
                            scale: 0,
                            opacity: 0
                        }}
                        transition={{ duration: 1.5, delay: i * 0.1, ease: 'easeOut' }}
                    />
                ))}
            </div>
        </motion.div>
    );
};