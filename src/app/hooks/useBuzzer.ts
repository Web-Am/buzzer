import { db } from '@/app/lib/firebase';
import { getCumulativeBid, getCurrentWinner } from '@/app/lib/game-logic';
import { useRoomStore } from '@/app/store/roomStore';
import { ref, runTransaction } from 'firebase/database';
import { useCallback } from 'react';

export function useBuzzer(roomCode: string) {
    const { userKey, room } = useRoomStore();

    const press = useCallback(
        async (increment: number = 1) => {
            if (!userKey || !room?.currentRound) return;

            if (![1, 5, 20].includes(increment)) {
                alert('Incremento non valido');
                return;
            }

            const roundRef = ref(db, `rooms/${roomCode}/currentRound`);

            try {
                await runTransaction(roundRef, (currentRound) => {
                    if (!currentRound) return currentRound;

                    if (currentRound.status === 'FINISHED') {
                        throw new Error('Round già terminato');
                    }

                    const presses = currentRound.presses || {};
                    const winner = getCurrentWinner(presses);

                    if (winner && winner.userId === userKey) {
                        throw new Error('Sei già il vincitore attuale');
                    }

                    const participant = room.participants?.[userKey];
                    if (!participant) {
                        throw new Error('Partecipante non trovato');
                    }

                    const pointsAvailable = participant.pointsTotal - (participant.pointsUsed || 0);
                    const userCumulativeBid = getCumulativeBid(presses, userKey);

                    let newCumulativeBid: number;
                    let cost: number;

                    if (userCumulativeBid === 0) {
                        cost = increment;
                        newCumulativeBid = increment;
                    } else {
                        const winnerCumulativeBid = winner?.cumulativeBid ?? 0;
                        const minimumToOutbid = winnerCumulativeBid - userCumulativeBid + increment;
                        const remainingBudget = pointsAvailable - userCumulativeBid;

                        if (remainingBudget < minimumToOutbid) {
                            throw new Error(`Punti insufficienti. Servono ${minimumToOutbid}, ne hai ${remainingBudget}`);
                        }

                        cost = minimumToOutbid;
                        newCumulativeBid = userCumulativeBid + minimumToOutbid;
                    }

                    if (cost > pointsAvailable) {
                        throw new Error(`Punti insufficienti. Servono ${cost}, ne hai ${pointsAvailable}`);
                    }

                    const newPress = {
                        userId: userKey,
                        value: increment,
                        cumulativeBid: newCumulativeBid,
                        pointsUsed: cost,
                        serverTs: Date.now(),
                        targetText: `+${increment}`
                    };

                    return {
                        ...currentRound,
                        startTs: Date.now(),
                        presses: {
                            ...currentRound.presses,
                            [userKey]: newPress
                        }
                    };
                });

                console.log(`✅ Buzz registrato: +${increment}, cumulativo: ${getCumulativeBid(room.currentRound?.presses, userKey) + increment}`);
            } catch (error) {
                console.error('Errore durante il buzz:', error);
                alert(error instanceof Error ? error.message : 'Errore durante il buzz');
            }
        },
        [userKey, roomCode, room]
    );

    const pressCustom = useCallback(
        async (amount: number) => {
            if (!userKey || !room?.currentRound) return;

            const roundRef = ref(db, `rooms/${roomCode}/currentRound`);

            try {
                await runTransaction(roundRef, (currentRound) => {
                    if (!currentRound) return currentRound;

                    if (currentRound.status === 'FINISHED') {
                        throw new Error('Round già terminato');
                    }

                    const presses = currentRound.presses || {};
                    const winner = getCurrentWinner(presses);

                    if (winner && winner.userId === userKey) {
                        throw new Error('Sei già il vincitore attuale');
                    }

                    const participant = room.participants?.[userKey];
                    if (!participant) {
                        throw new Error('Partecipante non trovato');
                    }

                    const pointsAvailable = participant.pointsTotal - (participant.pointsUsed || 0);
                    const userCumulativeBid = getCumulativeBid(presses, userKey);

                    if (amount <= 0) {
                        throw new Error('Inserisci un valore positivo');
                    }

                    let newCumulativeBid: number;

                    if (userCumulativeBid === 0) {
                        newCumulativeBid = amount;
                    } else {
                        const winnerCumulativeBid = winner?.cumulativeBid ?? 0;
                        const minimumToOutbid = winnerCumulativeBid - userCumulativeBid + 1;
                        if (amount < minimumToOutbid) {
                            throw new Error(`Devi puntare almeno ${minimumToOutbid} punti per superare il vincitore attuale`);
                        }
                        newCumulativeBid = userCumulativeBid + amount;
                    }

                    if (newCumulativeBid > pointsAvailable + userCumulativeBid) {
                        throw new Error(`Punti insufficienti. Hai massimo ${pointsAvailable} punti disponibili`);
                    }

                    const newPress = {
                        userId: userKey,
                        value: amount,
                        cumulativeBid: newCumulativeBid,
                        pointsUsed: amount,
                        serverTs: Date.now(),
                        targetText: `custom`
                    };

                    return {
                        ...currentRound,
                        startTs: Date.now(),
                        presses: {
                            ...currentRound.presses,
                            [userKey]: newPress
                        }
                    };
                });

                console.log(`✅ Buzz personalizzato: ${amount}, cumulativo: ${getCumulativeBid(room.currentRound?.presses, userKey) + amount}`);
            } catch (error) {
                console.error('Errore durante il buzz:', error);
                alert(error instanceof Error ? error.message : 'Errore durante il buzz');
            }
        },
        [userKey, roomCode, room]
    );

    return { press, pressCustom };
}
