// app/hooks/useBuzzer.ts

import { db } from '@/app/lib/firebase';
import { calculateRequiredPoints } from '@/app/lib/game-logic';
import { useRoomStore } from '@/app/store/roomStore';
import { ref, runTransaction } from 'firebase/database';
import { useCallback } from 'react';

export function useBuzzer(roomCode: string) {
    const { userKey, room } = useRoomStore();

    const press = useCallback(
        async (bonus: number = 1) => {
            if (!userKey || !room?.currentRound) return;

            const roundRef = ref(db, `rooms/${roomCode}/currentRound`);
            const participantRef = ref(db, `rooms/${roomCode}/participants/${userKey}`);

            try {
                await runTransaction(roundRef, (currentRound) => {
                    if (!currentRound) return currentRound;

                    // Verifica che il round sia ancora attivo
                    if (currentRound.status === 'FINISHED') {
                        throw new Error('Round già terminato');
                    }

                    const presses = currentRound.presses || {};
                    const requiredPoints = calculateRequiredPoints(presses, bonus);

                    // Verifica punti disponibili
                    const participant = room.participants[userKey];
                    const pointsAvailable = participant.pointsTotal - participant.pointsUsed;

                    if (pointsAvailable < requiredPoints) {
                        throw new Error(`Punti insufficienti. Servono ${requiredPoints}, ne hai ${pointsAvailable}`);
                    }

                    // Registra la pressione
                    const newPress = {
                        userId: userKey,
                        pointsUsed: requiredPoints,
                        serverTs: Date.now(),
                        targetText: 'BUZZ',
                        value: bonus
                    };

                    // RESET DEL TIMER: ricalcola startTs e endTs
                    const timerMs = currentRound.timerMs;
                    const now = Date.now();

                    return {
                        ...currentRound,
                        presses: {
                            ...presses,
                            [userKey]: newPress
                        },
                        startTs: now,
                        endTs: now + timerMs
                    };
                });

                // Aggiorna i punti usati dal partecipante
                await runTransaction(participantRef, (participant) => {
                    if (!participant) return participant;

                    const presses = room.currentRound?.presses || {};
                    const requiredPoints = calculateRequiredPoints(presses, bonus);

                    return {
                        ...participant,
                        pointsUsed: requiredPoints,
                        updatedAt: Date.now()
                    };
                });

                console.log(`✅ Buzz registrato: ${bonus} punti`);
            } catch (error) {
                console.error('Errore durante il buzz:', error);
                alert(error instanceof Error ? error.message : 'Errore durante il buzz');
            }
        },
        [userKey, roomCode, room]
    );

    return { press };
}