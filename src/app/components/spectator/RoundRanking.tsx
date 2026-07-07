'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Room } from '@/app/types';

interface Props {
    room: Room;
}

export function RoundRanking({ room }: Props) {
    const rankings = useMemo(() => {
        const round = room.currentRound;
        if (!round || !round.presses || Object.keys(round.presses).length === 0) return null;

        const entries = Object.entries(round.presses)
            .map(([userId, press]) => {
                const participant = room.participants?.[userId];
                return {
                    userId,
                    name: participant?.name || 'Sconosciuto',
                    cumulativeBid: press.cumulativeBid ?? 0,
                    serverTs: press.serverTs ?? 0,
                };
            })
            .sort((a, b) => {
                if (b.cumulativeBid !== a.cumulativeBid) return b.cumulativeBid - a.cumulativeBid;
                return a.serverTs - b.serverTs;
            });

        return entries;
    }, [room]);

    if (!room.currentRound) {
        return (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                In attesa che il Master avvii un nuovo round...
            </p>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-3">Classifica Round</h3>
            {!rankings ? (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                    Nessuna votazione ancora. Premi il buzzer!
                </p>
            ) : (
                <div className="space-y-2">
                    {rankings.map((entry, idx) => (
                        <motion.div
                            key={entry.userId}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                                idx === 0
                                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700'
                                    : 'bg-gray-50 dark:bg-gray-800/50 border border-transparent'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                                    idx === 0
                                        ? 'bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}>
                                    {idx === 0 ? '🥇' : `#${idx + 1}`}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {entry.name}
                                </span>
                            </div>
                            <span className={`font-mono font-bold text-sm ${
                                idx === 0
                                    ? 'text-yellow-700 dark:text-yellow-300'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}>
                                {entry.cumulativeBid} crediti
                            </span>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
