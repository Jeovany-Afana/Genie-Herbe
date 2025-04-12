import {AnimatePresence, motion} from "framer-motion";
import React from "react";

<div className="relative z-10 p-5 pt-3">
    <AnimatePresence mode="wait">
        {activeView === 'players' ? (
            <motion.div
                key="players"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
            >
                {/* Affichage de la liste des joueurs triée – affichage en grille responsive */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {sortedPlayers.map(player => (
                        <PlayerCard
                            key={player.id}
                            player={player}
                            teamIndex={teamIndex}
                            isBestScorer={sortedPlayers[0]?.id === player.id && player.pointsScored > 0}
                            onToggle={() => togglePlayerStatus(teamIndex, player.id)}
                        />
                    ))}
                </div>
            </motion.div>
        ) : (
            <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
            >
                {/* Affichage des statistiques avancées */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-xs text-white/60 mb-1">Meilleur marqueur</div>
                        <div className="font-medium truncate">
                            {sortedPlayers[0]?.pointsScored > 0 ? sortedPlayers[0].name : '-'}
                        </div>
                        <div className="text-sm text-yellow-400">
                            {sortedPlayers[0]?.pointsScored > 0 ? `${sortedPlayers[0].pointsScored} pts` : ''}
                        </div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-xs text-white/60 mb-1">Dernier gain</div>
                        <div className={`text-xl font-mono ${
                            team.lastScoreChange >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                            {team.lastScoreChange >= 0 ? '+' : ''}{team.lastScoreChange}
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
</div>