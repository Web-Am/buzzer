'use client';

import { ref, update, get } from 'firebase/database';
import { database } from '../lib/firebase';
import { determineWinner } from '../lib/game-logic';
import { useRoomStore } from '../store/roomStore';
import { useUIStore } from '../store/uiStore';
import { RoundWon } from '../types/room';
import { Round } from '../types/round';

export function useRound() {
    const { roomCode, room } = useRoomStore();
    const {
        setStartingRound,
        setFinishingRound,
        showNotification
    } = useUIStore();

    /**
     * Avvia un nuovo round (solo Master)
     */
    const startRound = async (data: {
        questionText: string;
        maxPoints: number;
    }): Promise<boolean> => {
        if (!roomCode || !room) {
            showNotification('error', 'Nessuna stanza attiva');
            return false;
        }

        if (room.currentRound?.status === 'IN_PROGRESS') {
            showNotification('warning', 'Un round è già in corso');
            return false;
        }

        setStartingRound(true);

        try {
            const newRound: Round = {
                questionText: data.questionText,
                maxPoints: data.maxPoints,
                status: 'IN_PROGRESS',
                startTs: Date.now(),
                timerMs: room.settings.timerCountdown,
                presses: {},
            };

            await update(ref(database, `rooms/${roomCode}`), {
                currentRound: newRound,
                updatedAt: Date.now(),
            });

            showNotification('success', 'Round avviato!');
            return true;
        } catch (err) {
            console.error('Errore avvio round:', err);
            showNotification('error', 'Errore durante l\'avvio del round');
            return false;
        } finally {
            setStartingRound(false);
        }
    };

    /**
     * Termina il round corrente (solo Master)
     */
    const finishRound = async (): Promise<boolean> => {
        if (!roomCode || !room?.currentRound) {
            showNotification('error', 'Nessun round attivo');
            return false;
        }

        if (room.currentRound.status === 'FINISHED') {
            showNotification('info', 'Il round è già terminato');
            return false;
        }

        setFinishingRound(true);

        try {
            const { currentRound } = room;
            const presses = currentRound.presses ?? {};

            // Determina vincitore
            const winnerKey = determineWinner(presses);

            if (!winnerKey) {
                // Nessuna press - chiudi round senza vincitore
                await update(ref(database, `rooms/${roomCode}`), {
                    'currentRound/status': 'FINISHED',
                    'currentRound/endTs': Date.now(),
                    updatedAt: Date.now(),
                });

                showNotification('info', 'Round terminato senza vincitore');
                return true;
            }

            const winnerPress = presses[winnerKey];
            const participant = room.participants[winnerKey];

            if (!participant) {
                throw new Error('Partecipante vincitore non trovato');
            }

            // Crea oggetto RoundWon
            const roundWon: RoundWon = {
                questionText: currentRound.questionText,
                pointsAwarded: currentRound.maxPoints,
                timestamp: Date.now(),
            };

            // Update atomico multi-path
            const updates: Record<string, any> = {
                'currentRound/status': 'FINISHED',
                'currentRound/winner': winnerKey,
                'currentRound/winnerPoints': currentRound.maxPoints,
                'currentRound/endTs': Date.now(),
                [`participants/${winnerKey}/roundsWon`]: [
                    ...(participant.roundsWon ?? []),
                    roundWon,
                ],
                updatedAt: Date.now(),
            };

            await update(ref(database, `rooms/${roomCode}`), updates);

            showNotification('success', `Round vinto da ${participant.name}!`);
            return true;
        } catch (err) {
            console.error('Errore chiusura round:', err);
            showNotification('error', 'Errore durante la chiusura del round');
            return false;
        } finally {
            setFinishingRound(false);
        }
    };

    /**
     * Auto-finish quando il timer scade
     */
    const autoFinishRound = async (): Promise<void> => {
        if (!room?.currentRound || room.currentRound.status === 'FINISHED') {
            return;
        }

        const elapsed = Date.now() - room.currentRound.startTs;
        if (elapsed >= room.currentRound.timerMs) {
            await finishRound();
        }
    };

    return {
        startRound,
        finishRound,
        autoFinishRound,
    };
}