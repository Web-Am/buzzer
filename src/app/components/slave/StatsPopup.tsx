'use client';

import { useLeaderboard } from '@/app/hooks/usePartecipants';
import { useRoomStore } from '@/app/store/roomStore';
import { useUIStore } from '@/app/store/uiStore';
import { motion } from 'framer-motion';
import { BarChart3, X } from 'lucide-react';

export function StatsPopup() {
    const { room } = useRoomStore();
    const { isStatsPopupOpen, setStatsPopupOpen } = useUIStore();
    const { leaderboard } = useLeaderboard();

    if (!isStatsPopupOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <BarChart3 size={24} className="text-primary-600" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Statistiche Partecipanti
                        </h2>
                    </div>
                    <button
                        onClick={() => setStatsPopupOpen(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                    <div className="space-y-4">
                        {leaderboard.map((participant, index) => (
                            <motion.div
                                key={participant.userKey}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
                            >
                                {/* Header partecipante */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                                            {participant.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                {participant.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {participant.roundsWonCount} round{' '}
                                                {participant.roundsWonCount === 1 ? 'vinto' : 'vinti'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {participant.availablePoints}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            / {participant.pointsTotal}
                                        </p>
                                    </div>
                                </div>

                                {/* Barra progresso */}
                                <div className="mb-3">
                                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${(participant.pointsUsed / participant.pointsTotal) * 100}%`,
                                            }}
                                            transition={{ duration: 0.5 }}
                                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                        />
                                    </div>
                                </div>

                                {/* Round vinti */}
                                {participant.roundsWon && participant.roundsWon.length > 0 && (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Round Vinti:
                                        </p>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {participant.roundsWon.map((round, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-white dark:bg-gray-800 p-2 rounded-lg text-sm"
                                                >
                                                    <p className="text-gray-900 dark:text-white font-medium truncate">
                                                        {round.questionText}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                            {new Date(round.timestamp).toLocaleTimeString('it-IT')}
                                                        </span>
                                                        <span className="text-primary-600 dark:text-primary-400 font-bold text-xs">
                                                            +{round.pointsAwarded} pt
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {participant.roundsWon.length === 0 && (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                                        Nessun round vinto ancora
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}