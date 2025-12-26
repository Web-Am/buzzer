'use client';

import { useCallback, useMemo } from 'react';
import { useRoomStore } from '../store/roomStore';
import { Participant } from '../types/room';

export function useParticipant(userKey?: string) {
    const { room, userKey: currentUserKey } = useRoomStore();

    const targetKey = userKey ?? currentUserKey;

    const participant = useMemo<Participant | null>(() => {
        if (!room || !targetKey || !room.participants) {
            return null;
        }
        return room.participants[targetKey] ?? null;
    }, [room, targetKey]);

    const availablePoints = useMemo(() => {
        if (!participant) return 0;
        return calculateAvailablePoints(participant);
    }, [participant]);

    const hasEnoughPoints = useCallback((required: number) => {
        return availablePoints >= required;
    }, [availablePoints]);

    return {
        participant,
        availablePoints,
        hasEnoughPoints,
    };
}

/**
 * Hook per ottenere la leaderboard ordinata
 */
export function useLeaderboard() {
    const { room } = useRoomStore();

    const leaderboard = useMemo(() => {
        if (!room?.participants) return [];

        const entries = Object.entries(room.participants).map(([key, participant]) => ({
            userKey: key,
            ...participant,
            roundsWonCount: participant.roundsWon?.length ?? 0,
            availablePoints: calculateAvailablePoints(participant),
        }));

        // Ordina per numero round vinti (decrescente), poi per punti disponibili
        return entries.sort((a, b) => {
            if (b.roundsWonCount !== a.roundsWonCount) {
                return b.roundsWonCount - a.roundsWonCount;
            }
            return b.availablePoints - a.availablePoints;
        });
    }, [room]);

    return { leaderboard };
}

function calculateAvailablePoints(participant: Participant): any {
    return -1;
}
