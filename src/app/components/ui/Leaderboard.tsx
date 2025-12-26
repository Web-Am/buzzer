'use client';

import { desanitizeEmailKey } from '@/app/lib/firebase-utils';
import { Room } from '@/app/types';
import React, { useMemo } from 'react';

interface LeaderboardProps {
    room: Room;
}

export function Leaderboard({ room }: LeaderboardProps) {

    const entries = useMemo(() => {
        if (!room.participants) return [];

        console.log(room)
        console.log(room.participants)
        return Object.entries(room.participants)
            .map(([key, p]) => {
                const pointsUsed = p.pointsUsed ?? 0;
                const rounds = p.roundsWon ? p.roundsWon.length : 0;
                return {
                    key,
                    name: p.name,
                    roundsWon: rounds,
                    pointsUsed
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
                        className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                    >
                        <div className="flex items-center gap-2">
                            <span className="w-6 text-center text-sm font-semibold">
                                #{idx + 1}
                            </span>
                            <div>
                                <div className="text-sm font-medium">{e.name}</div>
                                <div className="text-xs text-gray-500">
                                    {desanitizeEmailKey(e.key)}
                                </div>
                            </div>
                        </div>
                        <div className="text-right text-xs">
                            <div className="font-semibold">{e.roundsWon} round vinti [{room.settings.totalPoints + "/" + e.pointsUsed}]</div>
                        </div>
                    </div>
                ))}
                {entries.length === 0 && (
                    <p className="text-sm text-gray-500">Ancora nessun partecipante.</p>
                )}
            </div>
        </div>
    );
}
