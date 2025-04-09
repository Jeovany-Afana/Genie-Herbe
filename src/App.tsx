import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Plus,
  Minus,
  Trophy,
  Users,
  RotateCcw,
  Crown,
  Check,
  Star,
  UserPlus,
  ArrowLeftRight,
  Volume2,
  VolumeX,
  Settings,
  Award,
  Home
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import useSound from 'use-sound';
import confetti from 'canvas-confetti';
import { DonutTimer } from './components/DonutTimer';
import { RubriqueDisplay } from './components/RubriqueDisplay';

// Types
interface Player {
  id: string;
  name: string;
  isActive: boolean;
  pointsScored: number;
}

interface Team {
  id: string;
  name: string;
  score: number;
  lastScoreChange: number;
  scoreUpdateTimestamp: number;
  players: Player[];
  isTeamA: boolean;
  color: string;
}

interface GameHistory {
  teams: Team[];
  timestamp: number;
}

// Constants
const POINTS_OPTIONS = [10, 20,];
const TIMER_OPTIONS = [5, 10,20,30,];
const TEAM_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'];
const MILESTONE_POINTS = 100;

function App() {
  // State
  const [teams, setTeams] = useState<Team[]>([
    {
      id: '1',
      name: 'Équipe 1',
      score: 0,
      lastScoreChange: 0,
      scoreUpdateTimestamp: 0,
      players: [],
      isTeamA: true,
      color: TEAM_COLORS[0]
    },
    {
      id: '2',
      name: 'Équipe 2',
      score: 0,
      lastScoreChange: 0,
      scoreUpdateTimestamp: 0,
      players: [],
      isTeamA: false,
      color: TEAM_COLORS[1]
    }
  ]);
  const [time, setTime] = useState<number>(30);
  const [maxTime, setMaxTime] = useState<number>(30);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [gamePhase, setGamePhase] = useState<'setup' | 'game' | 'results'>('setup');
  const [showAlert, setShowAlert] = useState<string>('');
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'game' | 'history'>('game');


  const [celebratingPlayer, setCelebratingPlayer] = useState<{player: Player, teamColor: string} | null>(null);

  // Refs
  const playerInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const timerCircleRef = useRef<SVGCircleElement>(null);
  const teamACardRef = useRef<HTMLDivElement>(null);
  const teamBCardRef = useRef<HTMLDivElement>(null);

  // Animations
  // Nous n'utiliserons plus timerControls dans DonutTimer, car l'animation est directement appliquée sur le <motion.span>.
  const teamAControls = useAnimation();
  const teamBControls = useAnimation();

  // Sound effects
  const [playTimerEnd] = useSound('/sounds/timer-end.mp3', { volume: isMuted ? 0 : 0.7 });
  const [playPointsGained] = useSound('/sounds/points-gained.mp3', { volume: isMuted ? 0 : 0.5 });
  const [playPointsLost] = useSound('/sounds/points-lost.mp3', { volume: isMuted ? 0 : 0.5 });
  const [playMilestone] = useSound('/sounds/milestone.mp3', { volume: isMuted ? 0 : 0.7 });
  const [playTeamChange] = useSound('/sounds/team-change.mp3', { volume: isMuted ? 0 : 0.4 });
  const [playButtonClick] = useSound('/sounds/button-click.mp3', { volume: isMuted ? 0 : 0.3 });

  useEffect(() => {
    if (isRunning && time > 0) {
      const timer = setTimeout(() => {
        setTime(prev => prev - 1);

        // Animation pour les dernières secondes
        if (time <= 5) {
          if (timerCircleRef.current) {
            timerCircleRef.current.animate([
              { transform: 'scale(1)' },
              { transform: 'scale(1.1)' },
              { transform: 'scale(1)' }
            ], {
              duration: 500,
              easing: 'ease-in-out'
            });
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (time === 0) {
      setIsRunning(false);
      playTimerEnd();

      // Animation spéciale pour la fin du timer
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#ffff00', '#00ff00']
      });
    }
  }, [isRunning, time, playTimerEnd]);
// Fonctions utilitaires
  const updateTeamName = (teamIndex: number, newName: string) => {
    setTeams((prevTeams) =>
        prevTeams.map((team, index) => (index === teamIndex ? { ...team, name: newName } : team))
    );
  };


  const triggerTieAnimation = () => {
    // Confetti spécial égalité (2 couleurs)
    confetti({
      particleCount: 100,
      angle: 90,
      spread: 100,
      origin: { y: 0.6 },
      colors: [teams[0].color, teams[1].color]
    });

    // Animation de vibration des deux cartes
    teamAControls.start({
      x: [0, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 }
    });

    teamBControls.start({
      x: [0, 10, -10, 5, -5, 0],
      transition: { duration: 0.5 }
    });

    // Texte "ÉGALITÉ !"
    const tieText = document.createElement('div');
    tieText.textContent = 'ÉGALITÉ !';
    tieText.style.position = 'fixed';
    tieText.style.left = '50%';
    tieText.style.top = '20%';
    tieText.style.transform = 'translateX(-50%)';
    tieText.style.fontSize = '4rem';
    tieText.style.fontWeight = '900';
    tieText.style.color = '#ffffff';
    tieText.style.textShadow = `2px 2px 0 ${teams[0].color}, -2px -2px 0 ${teams[1].color}`;
    tieText.style.zIndex = '9999';

    document.body.appendChild(tieText);

    tieText.animate([
      { opacity: 0, transform: 'translateX(-50%) translateY(-50px)' },
      { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
      { opacity: 0, transform: 'translateX(-50%) translateY(50px)' }
    ], { duration: 2000, easing: 'ease-in-out' });

    setTimeout(() => tieText.remove(), 2000);
  };


  const triggerNewLeaderAnimation = (teamIndex: number) => {
    const team = teams[teamIndex];
    const opponentIndex = teamIndex === 0 ? 1 : 0;

    // Gros confetti en arc de cercle
    confetti({
      particleCount: 150,
      angle: 60 + teamIndex * 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: [team.color],
      scalar: 1.2
    });

    // Flèche animée pointant vers le haut
    const arrow = document.createElement('div');
    arrow.innerHTML = '⬆️';
    arrow.style.position = 'fixed';
    arrow.style.left = `${teamIndex === 0 ? '25%' : '75%'}`;
    arrow.style.top = '50%';
    arrow.style.fontSize = '4rem';
    arrow.style.zIndex = '9999';
    arrow.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(arrow);

    arrow.animate([
      { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
      { opacity: 1, transform: 'translate(-50%, -50%) scale(1.5)' },
      { opacity: 0, transform: 'translate(-50%, -50%) scale(1)' }
    ], {
      duration: 1500,
      easing: 'ease-out'
    });

    // Texte "NOUVEAU LEADER !"
    const leaderText = document.createElement('div');
    leaderText.textContent = 'NOUVEAU LEADER !';
    leaderText.style.position = 'fixed';
    leaderText.style.left = '50%';
    leaderText.style.top = '20%';
    leaderText.style.transform = 'translateX(-50%)';
    leaderText.style.fontSize = '3.5rem';
    leaderText.style.fontWeight = '900';
    leaderText.style.color = team.color;
    leaderText.style.textShadow = '0 0 10px rgba(255,255,255,0.8)';
    leaderText.style.zIndex = '9999';

    document.body.appendChild(leaderText);

    leaderText.animate([
      { opacity: 0, transform: 'translateX(-50%) translateY(-50px)' },
      { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
      { opacity: 0, transform: 'translateX(-50%) translateY(50px)' }
    ], { duration: 2000, easing: 'ease-in-out' });

    // Flash de la carte
    const controls = teamIndex === 0 ? teamAControls : teamBControls;
    controls.start({
      scale: [1, 1.1, 1],
      backgroundColor: [`${team.color}20`, `${team.color}80`, `${team.color}20`],
      transition: { duration: 0.8 }
    });

    setTimeout(() => {
      arrow.remove();
      leaderText.remove();
    }, 2000);
  };


  const triggerCatchUpAnimation = (teamIndex: number) => {
    const team = teams[teamIndex];
    const opponentIndex = teamIndex === 0 ? 1 : 0;
    const diff = teams[opponentIndex].score - team.score;

    // Messages d'encouragement en fonction de l'écart
    const messages = {
      small: ["ALLEZ !", "PRÈS DU BUT !", "CONTINUEZ !"],
      medium: ["BEAU EFFORT !", "VOUS Y ÊTES !", "ACCROCHEZ-VOUS !"],
      large: ["NE LÂCHEZ RIEN !", "TOUT EST POSSIBLE !", "REMONTADA EN VUE !"]
    };

    let messageType = 'small';
    if (diff > 20) messageType = 'large';
    else if (diff > 10) messageType = 'medium';

    const message = messages[messageType][Math.floor(Math.random() * messages[messageType].length)];

    // Création du texte d'encouragement
    const encouragementText = document.createElement('div');
    encouragementText.textContent = message;
    encouragementText.style.position = 'fixed';
    encouragementText.style.left = '50%';
    encouragementText.style.top = '30%';
    encouragementText.style.transform = 'translateX(-50%)';
    encouragementText.style.fontSize = '3.5rem';
    encouragementText.style.fontWeight = '900';
    encouragementText.style.color = team.color;
    encouragementText.style.textShadow = '0 0 10px rgba(255,255,255,0.8)';
    encouragementText.style.zIndex = '9999';
    encouragementText.style.textAlign = 'center';

    document.body.appendChild(encouragementText);

    // Animation du texte
    encouragementText.animate([
      { opacity: 0, transform: 'translateX(-50%) translateY(-20px)' },
      { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
      { opacity: 0, transform: 'translateX(-50%) translateY(20px)' }
    ], {
      duration: 2000,
      easing: 'ease-in-out'
    });

    // Petits confettis incitatifs
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        confetti({
          particleCount: 30,
          angle: 60 + teamIndex * 60,
          spread: 40,
          origin: { y: 0.7 },
          colors: [team.color],
          scalar: 0.8
        });
      }, i * 300);
    }

    setTimeout(() => encouragementText.remove(), 2000);
  };



  const triggerPlayerScoreAnimation = (teamIndex: number, playerId: string, points: number) => {
    const team = teams[teamIndex];
    const player = team.players.find(p => p.id === playerId);
    if (!player) return;

    // Afficher l'animation du joueur
    setCelebratingPlayer({ player, teamColor: team.color });
    setTimeout(() => setCelebratingPlayer(null), 2000);

    // Couleur de l'équipe pour les animations
    const teamColor = team.color;

    // 1. Confetti spécial pour le joueur
    confetti({
      particleCount: 50,
      angle: 60 + teamIndex * 60,
      spread: 50,
      origin: { y: 0.6 },
      colors: [teamColor],
      scalar: 1.2
    });

    // 2. Création d'un élément flottant pour les points
    const pointsElement = document.createElement('div');
    pointsElement.textContent = `+${points}`;
    pointsElement.style.position = 'fixed';
    pointsElement.style.left = `${teamIndex === 0 ? '25%' : '75%'}`;
    pointsElement.style.top = '60%';
    pointsElement.style.fontSize = '3rem';
    pointsElement.style.fontWeight = 'bold';
    pointsElement.style.color = teamColor;
    pointsElement.style.textShadow = '0 0 10px rgba(255,255,255,0.8)';
    pointsElement.style.zIndex = '9999';
    pointsElement.style.opacity = '0';

    document.body.appendChild(pointsElement);

    // Animation des points
    pointsElement.animate([
      { opacity: 0, transform: 'translateY(0) scale(0.5)' },
      { opacity: 1, transform: 'translateY(-50px) scale(1.5)' },
      { opacity: 0, transform: 'translateY(-100px) scale(1)' }
    ], {
      duration: 1500,
      easing: 'ease-out'
    });

    // 3. Notification avec le nom du joueur
    const playerElement = document.createElement('div');
    playerElement.textContent = `${player.name} a marqué !`;
    playerElement.style.position = 'fixed';
    playerElement.style.left = '50%';
    playerElement.style.top = '40%';
    playerElement.style.transform = 'translateX(-50%)';
    playerElement.style.fontSize = '1.5rem';
    playerElement.style.color = 'white';
    playerElement.style.backgroundColor = `${teamColor}CC`;
    playerElement.style.padding = '10px 20px';
    playerElement.style.borderRadius = '20px';
    playerElement.style.zIndex = '9999';

    document.body.appendChild(playerElement);

    // Animation du nom du joueur
    playerElement.animate([
      { opacity: 0, transform: 'translateX(-50%) translateY(-20px)' },
      { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
      { opacity: 0, transform: 'translateX(-50%) translateY(20px)' }
    ], {
      duration: 2000,
      easing: 'ease-in-out'
    });

    // Nettoyage après l'animation
    setTimeout(() => {
      pointsElement.remove();
      playerElement.remove();
    }, 2000);

    // Jouer le son des points gagnés
    if (points > 0) {
      playPointsGained();
    } else {
      playPointsLost();
    }
  };



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

  const startTimer = (seconds: number) => {
    setTime(seconds);
    setMaxTime(seconds);
    setIsRunning(true);
  };

  const resetTimer = () => {
    setTime(maxTime);
    setIsRunning(false);
  };


  const checkTeamMilestones = (teams: Team[], scoringTeamIndex: number, points: number) => {
    const team = teams[scoringTeamIndex];

    // Vérification des paliers
    const prevScore = team.score - points;
    if (Math.floor(prevScore / MILESTONE_POINTS) < Math.floor(team.score / MILESTONE_POINTS)) {
      triggerMilestone(team.name);
    }

    // Détection des événements spéciaux (votre logique existante)
    const wasLeadingBefore = getWinningTeam(teams.map((t, i) =>
        i === scoringTeamIndex ? { ...t, score: t.score - points } : t
    ));

    const isLeadingNow = getWinningTeam(teams);
    // ... (le reste de votre logique d'animation d'équipe)
  };


  const triggerComebackAnimation = (teamIndex: number) => {
    const team = teams[teamIndex];

    // Confetti en forme de vague montante
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 270,
          spread: 50,
          startVelocity: 45 - i * 5,
          origin: { y: 0.8 },
          colors: [team.color],
          scalar: 1 - i * 0.1
        });
      }, i * 200);
    }

    // Gros texte animé avec effet de vague
    const comebackText = document.createElement('div');
    comebackText.textContent = 'REMOONTADA !!!';
    comebackText.style.position = 'fixed';
    comebackText.style.left = '50%';
    comebackText.style.top = '30%';
    comebackText.style.transform = 'translateX(-50%)';
    comebackText.style.fontSize = '5rem';
    comebackText.style.fontWeight = '900';
    comebackText.style.color = team.color;
    comebackText.style.textShadow = '0 0 15px rgba(255,255,255,0.9)';
    comebackText.style.zIndex = '9999';
    comebackText.style.textAlign = 'center';

    document.body.appendChild(comebackText);

    // Animation de chaque lettre individuellement
    const letters = comebackText.textContent.split('');
    comebackText.textContent = '';
    letters.forEach((letter, i) => {
      const span = document.createElement('span');
      span.textContent = letter;
      span.style.display = 'inline-block';
      comebackText.appendChild(span);

      span.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 0 },
        { transform: 'translateY(-20px) rotate(5deg)', opacity: 1 },
        { transform: 'translateY(0) rotate(0deg)' }
      ], {
        duration: 1000,
        delay: i * 100,
        easing: 'ease-out'
      });
    });

    setTimeout(() => comebackText.remove(), 3000);
  };

  const updatePlayerScore = (teamIndex: number, playerId: string, points: number) => {
    playButtonClick();
    const now = Date.now();

    setTeams(prevTeams => {
      const newTeams = prevTeams.map((team, index) => {
        if (index !== teamIndex) return team;

        // Trouver le joueur qui marque
        const scoringPlayer = team.players.find(p => p.id === playerId);
        if (!scoringPlayer) return team;

        // Nouveau score de l'équipe
        const newScore = team.score + points;

        // Mettre à jour seulement le joueur qui marque
        const updatedPlayers = team.players.map(p =>
            p.id === playerId
                ? { ...p, pointsScored: p.pointsScored + Math.max(0, points) }
                : p
        );

        // Trouver le meilleur marqueur
        const bestScorer = [...updatedPlayers]
            .sort((a, b) => b.pointsScored - a.pointsScored)[0];

        // Déclencher l'animation si c'est un nouveau meilleur marqueur
        if (bestScorer.id === playerId && scoringPlayer.pointsScored <= bestScorer.pointsScored - points) {
          triggerBestScorerAnimation(teamIndex, bestScorer);
        }

        return {
          ...team,
          score: newScore,
          lastScoreChange: points,
          scoreUpdateTimestamp: now,
          players: updatedPlayers
        };
      });

      // Vérifier les paliers et autres animations d'équipe
      checkTeamMilestones(newTeams, teamIndex, points);

      // Déclencher l'animation du joueur
      const scoringPlayer = newTeams[teamIndex].players.find(p => p.id === playerId);
      if (scoringPlayer) {
        triggerPlayerScoreAnimation(teamIndex, playerId, points);
      }

      return newTeams;
    });
  };

  const triggerBestScorerAnimation = (teamIndex: number, player: Player) => {
    const team = teams[teamIndex];

    // Création de l'élément DOM
    const crownElement = document.createElement('div');
    crownElement.innerHTML = `
    <div style="
      position: fixed;
      left: ${teamIndex === 0 ? '25%' : '75%'};
      top: 40%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      text-align: center;
    ">
      <div style="
        font-size: 4rem;
        animation: float 3s ease-in-out infinite;
      ">👑</div>
      <div style="
        background: linear-gradient(135deg, ${team.color}, #FFD700);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: bold;
        margin-top: -20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      ">
        ${player.name}<br>
        <span style="font-size: 0.8em">Meilleur marqueur</span>
      </div>
    </div>
  `;

    document.body.appendChild(crownElement);

    // Confetti doré
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: teamIndex === 0 ? 45 : 135,
          spread: 50,
          origin: { x: teamIndex === 0 ? 0.25 : 0.75, y: 0.5 },
          colors: ['#FFD700', team.color, '#FFFFFF'],
          shapes: ['star', 'circle'],
          scalar: 1.2
        });
      }, i * 300);
    }

    // Suppression après 3 secondes
    setTimeout(() => crownElement.remove(), 3000);
  };

// Modifie updateScore pour détecter les comebacks
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

          return {
            ...team,
            score: newScore,
            lastScoreChange: points,
            scoreUpdateTimestamp: now,
            players: team.players.map(p =>
                p.isActive ? {...p, pointsScored: p.pointsScored + Math.max(0, points)} : p
            )
          };
        }
        return team;
      });

      // Détection des événements spéciaux
      const wasLeadingBefore = getWinningTeam(prevTeams);
      const isLeadingNow = getWinningTeam(newTeams);
      const prevDiff = Math.abs(prevTeams[0].score - prevTeams[1].score);
      const newDiff = Math.abs(newTeams[0].score - newTeams[1].score);
      const scoringTeamIndex = teamIndex;
      const opponentIndex = teamIndex === 0 ? 1 : 0;

      console.log("Leader avant:", wasLeadingBefore, "Leader maintenant:", isLeadingNow); // Debug

      // Égalité
      if (newTeams[0].score === newTeams[1].score) {
        triggerTieAnimation();
      }
      // Nouveau leader
      else if (wasLeadingBefore !== isLeadingNow && isLeadingNow !== -1) {
        console.log("Nouveau leader détecté:", isLeadingNow); // Debug
        // Remontada si l'écart était important
        if (prevDiff >= 20) {
          triggerComebackAnimation(isLeadingNow);
        } else {
          triggerNewLeaderAnimation(isLeadingNow);
        }
      }
      // Réduction d'écart significative (sans encore prendre la tête)
      else if (newDiff < 10 && prevDiff >= 10) {
        // On encourage l'équipe qui était derrière si c'est elle qui marque
        if (newTeams[scoringTeamIndex].score < newTeams[opponentIndex].score) {
          triggerCatchUpAnimation(scoringTeamIndex);
        }
      }
      // L'équipe qui était derrière marque (mais écart reste > 10)
      else if (points > 0 && newTeams[scoringTeamIndex].score < newTeams[opponentIndex].score) {
        // 20% de chance de déclencher un encouragement aléatoire
        if (Math.random() < 0.2) {
          triggerCatchUpAnimation(scoringTeamIndex);
        }
      }

      setHistory([...history, { teams: newTeams, timestamp: now }]);
      return newTeams;
    });
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


  const addPlayer = (teamIndex: number) => {
    const inputRef = playerInputRefs[teamIndex];
    if (!inputRef.current) return;
    const playerName = inputRef.current.value.trim();
    if (!playerName) return;
    setTeams(
        teams.map((team, index) => {
          if (index === teamIndex) {
            return {
              ...team,
              players: [
                ...team.players,
                {
                  id: Date.now().toString(),
                  name: playerName,
                  isActive: team.players.length < 4,
                  pointsScored: 0
                }
              ]
            };
          }
          return team;
        })
    );
    inputRef.current.value = '';
    playButtonClick();
  };

  const swapTeamPositions = () => {
    // Animation de transition
    teamAControls.start({
      x: [0, 50, 0],
      transition: { duration: 0.5 }
    });
    teamBControls.start({
      x: [0, -50, 0],
      transition: { duration: 0.5 }
    });

    // Changement des positions après un léger délai
    setTimeout(() => {
      setTeams(teams.map((team) => ({
        ...team,
        isTeamA: !team.isTeamA
      })));
      playTeamChange();
    }, 250);
  };

  const changeTeamColor = (teamId: string) => {
    setTeams(
        teams.map((team) => {
          if (team.id === teamId) {
            const currentIndex = TEAM_COLORS.indexOf(team.color);
            const nextIndex = (currentIndex + 1) % TEAM_COLORS.length;
            return { ...team, color: TEAM_COLORS[nextIndex] };
          }
          return team;
        })
    );
    playButtonClick();
  };

  const startGame = () => {
    if (
        teams[0].name.trim() &&
        teams[1].name.trim() &&
        teams[0].players.length > 0 &&
        teams[1].players.length > 0
    ) {
      setGamePhase('game');
      setHistory([{ teams: [...teams], timestamp: Date.now() }]);
      playButtonClick();
    }
  };

  const endGame = () => {
    setGamePhase('results');
    playButtonClick();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  const resetGame = () => {
    setTeams([
      {
        id: '1',
        name: 'Équipe 1',
        score: 0,
        lastScoreChange: 0,
        scoreUpdateTimestamp: 0,
        players: [],
        isTeamA: true,
        color: TEAM_COLORS[0]
      },
      {
        id: '2',
        name: 'Équipe 2',
        score: 0,
        lastScoreChange: 0,
        scoreUpdateTimestamp: 0,
        players: [],
        isTeamA: false,
        color: TEAM_COLORS[1]
      }
    ]);
    setTime(30);
    setMaxTime(30);
    setIsRunning(false);
    setGamePhase('setup');
    setHistory([]);
    playButtonClick();
  };

  const getWinningTeam = (teamsArray: Team[] = teams) => {
    if (teamsArray[0].score > teamsArray[1].score) return 0;
    if (teamsArray[1].score > teamsArray[0].score) return 1;
    return -1; // Égalité
  };

  const togglePlayerStatus = (teamIndex: number, playerId: string) => {
    setTeams(
        teams.map((team, index) => {
          if (index === teamIndex) {
            return {
              ...team,
              players: team.players.map((player) =>
                  player.id === playerId ? { ...player, isActive: !player.isActive } : player
              )
            };
          }
          return team;
        })
    );
    playButtonClick();
  };

  const PlayerCelebration = () => {
    if (!celebratingPlayer) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
              animate={{
                scale: [1, 1.1, 1],
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-blue-900 px-8 py-6 rounded-xl font-bold text-xl shadow-xl border-4 border-yellow-300 text-center"
              style={{ backgroundColor: `${celebratingPlayer.teamColor}80` }}
          >
            <div className="text-4xl mb-2">🌟</div>
            <div>{celebratingPlayer.player.name}</div>
            <div className="text-2xl mt-2">+{celebratingPlayer.points} points</div>
          </motion.div>
        </motion.div>
    );
  };



// Modifie le composant MilestoneAlert pour plus de dynamisme
  const MilestoneAlert = ({ message }: { message: string }) => {
    const emojis = ['🏆', '🎯', '🌟', '💎', '👑'];
    const [currentEmoji, setCurrentEmoji] = useState(emojis[0]);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
      }, 300);
      return () => clearInterval(interval);
    }, []);

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
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-12 py-8 rounded-2xl font-bold text-3xl shadow-2xl border-4 border-yellow-300 flex items-center gap-4"
            >
              <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
              >
                {currentEmoji}
              </motion.span>
              {message}
              <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
              >
                {currentEmoji}
              </motion.span>
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
  const PlayerCard = ({ player, teamIndex, isBestScorer, onToggle }: {
    player: Player;
    teamIndex: number;
    isBestScorer: boolean;
    onToggle: () => void;
  }) => {
    const [isScoring, setIsScoring] = useState(false);

    const handleAddPoints = (points: number) => {
      setIsScoring(true);
      updatePlayerScore(teamIndex, player.id, points);
      setTimeout(() => setIsScoring(false), 1000);
    };

    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                player.isActive
                    ? isBestScorer
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 border-2 border-yellow-600'
                        : 'bg-green-400/20 border-2 border-green-400/50'
                    : 'bg-gray-400/20 border-2 border-gray-400/50'
            }`}
        >
      <span className={`${isBestScorer ? 'font-bold text-yellow-900' : 'text-white'}`}>
        {player.name}
      </span>

          <div className="flex items-center gap-2">
            <motion.span
                className={`text-xs px-2 py-1 rounded ${
                    isBestScorer
                        ? 'bg-yellow-600 text-white'
                        : 'bg-green-500/50 text-white'
                }`}
                animate={{
                  scale: isScoring ? [1, 1.5, 1] : 1,
                  backgroundColor: isScoring
                      ? ['#FFD700', team.color, '#FFD700']
                      : isBestScorer ? '#D4AF37' : '#10B98180'
                }}
            >
              {player.pointsScored} pts
            </motion.span>

            {player.isActive && (
                <div className="flex gap-1">
                  <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddPoints(10);
                      }}
                      className="text-xs bg-yellow-400 text-blue-900 px-1 rounded"
                  >
                    +10
                  </motion.button>
                  <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddPoints(-10);
                      }}
                      className="text-xs bg-red-400 text-white px-1 rounded"
                  >
                    -10
                  </motion.button>
                </div>
            )}

            <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className={`text-sm px-2 py-1 rounded ${
                    player.isActive
                        ? isBestScorer
                            ? 'bg-yellow-600 text-white'
                            : 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                }`}
            >
              {player.isActive ? 'Actif' : 'Rempl.'}
            </button>
          </div>
        </motion.div>
    );
  };
  // Composant ScoreButton (inchangé)
  const ScoreButton = ({ points, onClick, isPositive }: { points: number; onClick: () => void; isPositive: boolean }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`w-full flex items-center justify-center gap-1 py-2 rounded-lg font-semibold ${
                isPositive
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            }`}
        >
          {isPositive ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          {points}
        </motion.button>
    );
  };

  // Composant TeamCard avec adaptation pour afficher la couronne et ajouter un effet de pulsation sur la carte gagnante
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

    // Dans TeamCard, avant le rendu :
    const bestScorer = team.players.reduce((max, player) =>
            player.pointsScored > max.pointsScored ? player : max,
        { pointsScored: -1 }
    );
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
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 10, -10, 0],
                    y: [0, -10, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-6 -right-6 text-5xl"
                  style={{ color: team.color }}
              >
                🏆
              </motion.div>
          )}


          {isWinning && (
              <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 -right-3 animate-float"
              >
                <Crown className="h-8 w-8" style={{ color: team.color }} />
              </motion.div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" style={{ color: team.color }} />
              <h2 className="text-2xl font-bold" style={{ color: team.color }}>
                {team.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: team.color }}>
              {team.isTeamA ? 'Équipe A' : 'Équipe B'}
            </span>
              {gamePhase === 'setup' && (
                  <button
                      onClick={() => changeTeamColor(team.id)}
                      className="w-5 h-5 rounded-full border-2 border-white"
                      style={{ backgroundColor: team.color }}
                  />
              )}
            </div>
          </div>

          <motion.div
              animate={{ scale: team.lastScoreChange !== 0 ? [1, 1.1, 1] : 1 }}
              className={`text-7xl font-bold text-center my-4 tabular-nums ${
                  team.lastScoreChange > 0
                      ? 'text-green-400'
                      : team.lastScoreChange < 0
                          ? 'text-red-400'
                          : 'text-white'
              }`}
          >
            {team.score}
          </motion.div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="space-y-2">
              <h3 className="font-semibold" style={{ color: team.color }}>
                Joueurs Actifs
              </h3>
              <div className="grid grid-cols-2 gap-2">


                {team.players.filter(p => p.isActive).map(player => (
                    <PlayerCard
                        key={player.id}
                        player={player}
                        teamIndex={teamIndex}
                        isBestScorer={player.id === bestScorer.id && bestScorer.pointsScored > 0}
                        onToggle={() => togglePlayerStatus(teamIndex, player.id)}
                    />
                ))}
              </div>
            </div>

            {team.players.filter((p) => !p.isActive).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-gray-400 font-semibold">Remplaçants</h3>
                  <div className="grid grid-cols-2 gap-2">

                    {team.players.filter(p => p.isActive).map(player => (
                        <PlayerCard
                            key={player.id}
                            player={player}
                            teamIndex={teamIndex}
                            isBestScorer={player.id === bestScorer.id && bestScorer.pointsScored > 0}
                            onToggle={() => togglePlayerStatus(teamIndex, player.id)}
                        />
                    ))}
                  </div>
                </div>
            )}
          </div>

          {gamePhase === 'game' && (
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="space-y-2">
                  {POINTS_OPTIONS.slice(0, 4).map((point) => (
                      <ScoreButton
                          key={`add-${point}`}
                          points={point}
                          onClick={() => updateScore(teamIndex, point)}
                          isPositive={true}
                      />
                  ))}
                </div>
                <div className="space-y-2">
                  {POINTS_OPTIONS.slice(0, 4).map((point) => (
                      <ScoreButton
                          key={`subtract-${point}`}
                          points={point}
                          onClick={() => updateScore(teamIndex, -point)}
                          isPositive={false}
                      />
                  ))}
                </div>
              </div>
          )}
        </motion.div>
    );
  };

  // Composant TimerCard intégrant le DonutTimer et les contrôles de timer
  const TimerCard = () => {
    return (
        <motion.div
            //initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-effect rounded-xl p-6 shadow-xl border-2 border-yellow-400/30 flex flex-col items-center justify-center"
        >
          <DonutTimer time={time} maxTime={maxTime} isRunning={isRunning} />
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {TIMER_OPTIONS.map((seconds) => (
                <motion.button
                    key={seconds}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      startTimer(seconds);
                      playButtonClick();
                    }}
                    className="px-3 py-1 glass-effect text-yellow-400 rounded-lg text-sm border border-yellow-400/30"
                >
                  {seconds}s
                </motion.button>
            ))}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsRunning(false);
                  playButtonClick();
                }}
                className="px-3 py-1 bg-red-500/80 text-white rounded-lg text-sm"
            >
              Pause
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetTimer();
                  playButtonClick();
                }}
                className="px-3 py-1 glass-effect text-white rounded-lg flex items-center gap-1 text-sm border border-white/30"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </motion.button>
          </div>
        </motion.div>
    );
  };
  // Rendu de l'application
  if (gamePhase === 'setup') {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 gradient-animate p-4 md:p-8 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-center mb-8">
              <motion.h1 initial={{ y: -20 }} animate={{ y: 0 }} className="text-6xl font-bold text-center text-yellow-400 flex items-center justify-center gap-4">
                <Trophy className="h-14 w-14" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
                Génie en Herbe
              </span>
              </motion.h1>

              <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full glass-effect">
                {isMuted ? <VolumeX className="h-6 w-6 text-yellow-400" /> : <Volume2 className="h-6 w-6 text-yellow-400" />}
              </button>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-8 shadow-xl border-2 border-yellow-400/30">
              <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                <Star className="h-6 w-6 text-yellow-400" />
                Configuration des Équipes
                <Star className="h-6 w-6 text-yellow-400" />
              </h2>
              <div className="space-y-8">
                {teams.map((team, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="space-y-4 group"
                    >
                      <div className="flex items-center justify-between">
                        <label className="block text-yellow-400 font-medium flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Équipe {index + 1}
                        </label>
                        <div className="text-yellow-400 flex items-center gap-2">
                          {team.isTeamA ? 'Équipe A' : 'Équipe B'}
                        </div>
                      </div>
                      <input
                          type="text"
                          value={team.name}
                          onChange={(e) => updateTeamName(index, e.target.value)}
                          placeholder={`Nom de l'équipe ${index + 1}`}
                          className="w-full px-4 py-3 rounded-xl glass-effect border-2 border-yellow-400/50 focus:border-yellow-400 text-white placeholder-white/50 outline-none transition-all duration-300 group-hover:border-yellow-400/75"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                              ref={playerInputRefs[index]}
                              type="text"
                              placeholder="Nom du joueur"
                              className="flex-1 px-4 py-2 rounded-xl glass-effect border-2 border-yellow-400/50 focus:border-yellow-400 text-white placeholder-white/50 outline-none"
                              onKeyPress={(e) => e.key === 'Enter' && addPlayer(index)}
                          />
                          <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => addPlayer(index)}
                              className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-xl flex items-center gap-2"
                          >
                            <UserPlus className="h-5 w-5" />
                            Ajouter
                          </motion.button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {team.players.map((player) => (
                              <PlayerCard key={player.id} player={player} onToggle={() => togglePlayerStatus(index, player.id)} />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                ))}
                <div className="flex justify-center mt-4">
                  <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={swapTeamPositions}
                      className="px-6 py-3 glass-effect text-yellow-400 rounded-xl flex items-center gap-2 border-2 border-yellow-400/30"
                  >
                    <ArrowLeftRight className="h-5 w-5" />
                    Échanger A/B
                  </motion.button>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    disabled={
                        !teams[0].name.trim() ||
                        !teams[1].name.trim() ||
                        teams[0].players.length === 0 ||
                        teams[1].players.length === 0
                    }
                    className="w-full mt-8 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 py-4 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-5 w-5" />
                  Commencer la partie
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 gradient-animate p-4 flex flex-col">
        <AnimatePresence>{showAlert && <MilestoneAlert message={showAlert} />}</AnimatePresence>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <motion.h1 initial={{ y: -20 }} animate={{ y: 0 }} className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-400" />
            Génie en Herbe
          </motion.h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full glass-effect">
              {isMuted ? <VolumeX className="h-5 w-5 text-yellow-400" /> : <Volume2 className="h-5 w-5 text-yellow-400" />}
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-full glass-effect">
              <Settings className="h-5 w-5 text-yellow-400" />
            </button>
          </div>
        </div>
        <RubriqueDisplay />
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
              <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-effect rounded-xl mb-4 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-yellow-400 font-semibold">Paramètres</h3>
                    <div className="flex gap-2">
                      <button
                          onClick={() => setActiveTab('game')}
                          className={`px-3 py-1 rounded-lg ${activeTab === 'game' ? 'bg-yellow-400 text-blue-900' : 'glass-effect text-yellow-400'}`}
                      >
                        Jeu
                      </button>
                      <button
                          onClick={() => setActiveTab('history')}
                          className={`px-3 py-1 rounded-lg ${activeTab === 'history' ? 'bg-yellow-400 text-blue-900' : 'glass-effect text-yellow-400'}`}
                      >
                        Historique
                      </button>
                    </div>
                  </div>
                  {activeTab === 'game' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {teams.map((team, index) => (
                              <div key={index} className="space-y-2">
                                <h4 className="text-white font-medium">{team.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-white">Couleur:</span>
                                  <button
                                      onClick={() => changeTeamColor(team.id)}
                                      className="w-6 h-6 rounded-full border-2 border-white"
                                      style={{ backgroundColor: team.color }}
                                  />
                                </div>
                              </div>
                          ))}
                        </div>
                        <div className="flex justify-between gap-2">
                          <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setShowSettings(false);
                                playButtonClick();
                              }}
                              className="flex-1 glass-effect text-yellow-400 py-2 rounded-lg"
                          >
                            Fermer
                          </motion.button>
                          <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                resetGame();
                                setShowSettings(false);
                              }}
                              className="flex-1 bg-red-500/80 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Réinitialiser
                          </motion.button>
                        </div>
                      </div>
                  ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {history.length === 0 ? (
                            <p className="text-white/70 text-center py-4">Aucun historique disponible</p>
                        ) : (
                            history.map((entry, index) => (
                                <div key={index} className="glass-effect p-3 rounded-lg">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-white/50">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {entry.teams.map((team, i) => (
                                        <div key={i} className="text-sm">
                              <span className="font-semibold" style={{ color: team.color }}>
                                {team.name}:
                              </span>
                                          <span className="text-white ml-1">{team.score} pts</span>
                                        </div>
                                    ))}
                                  </div>
                                </div>
                            ))
                        )}
                      </div>
                  )}
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* ... */}
        <AnimatePresence>
          {celebratingPlayer && (
              <PlayerCelebration
                  player={celebratingPlayer.player}
                  teamColor={celebratingPlayer.teamColor}
              />
          )}
        </AnimatePresence>
        {/* ... */}

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
          {/* Team A */}
          <TeamCard team={teams[0]} teamIndex={0} controls={teamAControls} />
          {/* Timer */}
          <TimerCard />
          {/* Team B */}
          <TeamCard team={teams[1]} teamIndex={1} controls={teamBControls} />
        </div>
        {/* Game Controls */}
        {gamePhase === 'game' && (
            <div className="flex justify-center mt-6">
              <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={endGame}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-xl flex items-center gap-2 font-semibold"
              >
                <Award className="h-5 w-5" />
                Terminer la partie
              </motion.button>
            </div>
        )}
        {/* Results Screen */}
        {gamePhase === 'results' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/70 flex items-center justify-center z-40">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="glass-effect rounded-2xl p-8 max-w-md w-full border-2 border-yellow-400/50">
                <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Résultats Finaux</h2>
                <div className="space-y-6">
                  {teams.map((team, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getWinningTeam() === index && (
                              <Crown className="h-6 w-6" style={{ color: team.color }} />
                          )}
                          <span className="text-xl font-semibold" style={{ color: team.color }}>
                      {team.name}
                    </span>
                        </div>
                        <span className="text-2xl font-bold text-white">{team.score} pts</span>
                      </div>
                  ))}
                  {getWinningTeam() === -1 && (
                      <div className="text-center text-yellow-400 font-semibold mt-4">Match nul !</div>
                  )}
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setGamePhase('game');
                          playButtonClick();
                        }}
                        className="glass-effect text-yellow-400 py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-5 w-5" />
                      Continuer
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          resetGame();
                          playButtonClick();
                        }}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
                    >
                      <Home className="h-5 w-5" />
                      Nouvelle partie
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
        )}
      </div>
  );
}

export default App;
