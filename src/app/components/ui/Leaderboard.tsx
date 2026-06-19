'use client';

import { desanitizeEmailKey } from '@/app/lib/firebase-utils';
import { Room } from '@/app/types';
import { useMemo } from 'react';

interface LeaderboardProps {
    room: Room;
}

export function Leaderboard({ room }: LeaderboardProps) {

    const entries = useMemo(() => {
        if (!room.participants) return [];

        return Object.entries(room.participants)
            .map(([key, p]) => {
                const pointsUsed = p.pointsUsed ?? 0;
                const rounds = p.roundsWon ? p.roundsWon.length : 0;
                const avail = (p.pointsTotal - pointsUsed);
                return {
                    key,
                    name: p.name,
                    roundsWon: rounds,
                    pointsUsed,
                    pointsTotal: p.pointsTotal,
                    available: avail,
                    isViewer: p.isViewer
                };
            })
            .sort((a, b) => b.roundsWon - a.roundsWon || a.pointsUsed - b.pointsUsed);
    }, [room]);

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Leaderboard</h3>
            <div className="space-y-2">
                {entries.map((e, idx) => (
                    <div
                        key={e.key}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 ${e.isViewer ? 'bg-gray-50/50 dark:bg-gray-800/30' : 'bg-gray-50 dark:bg-gray-800/50'}`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="w-6 text-center text-sm font-semibold">
                                #{idx + 1}
                            </span>
                            <div>
                                <div className="text-sm font-medium">
                                    {e.name}
                                    {e.isViewer && (
                                        <span className="ml-2 inline-block rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                            Viewer
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {desanitizeEmailKey(e.key)}
                                </div>
                            </div>
                        </div>
                        {!e.isViewer && (
                            <div className="text-right text-xs">
                                <div className="font-semibold">{e.roundsWon} round vinti</div>
                                <div className="text-gray-500 dark:text-gray-400">Crediti: {e.available}/{e.pointsTotal}</div>
                            </div>
                        )}
                    </div>
                ))}
                {entries.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ancora nessun partecipante.</p>
                )}
            </div>
        </div>
    );
}
