'use client';

import { ConnectionStatus } from '@/app/components/shared/ConnectionStatus';
import Header from '@/app/components/shared/Header';
import { Buzzer } from '@/app/components/slave/Buzzer';
import { MiniBuzzer } from '@/app/components/slave/MiniBuzzer';
import { QuestionDisplay } from '@/app/components/slave/QuestionDisplay';
import { WinnerModal } from '@/app/components/slave/WinnerModal';
import { Card } from '@/app/components/ui/Card';
import { Timer } from '@/app/components/ui/Timer';
import { useBuzzer } from '@/app/hooks/useBuzzer';
import { usePageLeave } from '@/app/hooks/useLeave';
import { useRoom } from '@/app/hooks/useRoom';
import { db } from '@/app/lib/firebase';
import { calculateRequiredPoints, canUserPress, getCurrentWinner } from '@/app/lib/game-logic';
import { useRoomStore } from '@/app/store/roomStore';
import { ref, update } from 'firebase/database';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export default function SlavePage() {
    const router = useRouter();
    const params = useParams<{ roomCode: string }>();
    const roomCode = params.roomCode;

    const { press } = useBuzzer(roomCode);
    const { loading } = useRoom(roomCode);
    const { room, setRoomCode, setRole, userKey, setUserKey } = useRoomStore();

    const SyncStatusOnline = async (online: boolean) => {
        if (!userKey) return;
        const roomRef = ref(db, `rooms/${roomCode}/participants/${userKey}`);
        await update(roomRef, { isOnline: online, updatedAt: Date.now() });
    };

    useEffect(() => {
        if (roomCode == null || roomCode.length !== 6) return;

        setRoomCode(roomCode);
        setRole('slave');

        const stored = localStorage.getItem(`userEmail_${roomCode}`);
        if (!stored) {
            alert("Non hai eseguito correttamente l'accesso");
            router.push(`/`);
        } else {
            setUserKey(stored);
        }
    }, [roomCode, router, setRoomCode, setRole, setUserKey]);

    useEffect(() => {
        if (userKey) SyncStatusOnline(true);
    }, [userKey]);

    usePageLeave(
        () => {
            SyncStatusOnline(false);
        },
        { onUnmount: true, confirmBeforeLeave: false }
    );

    const gameState = useMemo(() => {
        if (!room || !userKey) {
            return {
                round: null,
                participant: undefined,
                canPressButtons: {
                    base: { canPress: false, reason: 'Non pronto' },
                    bonus5: { canPress: false, reason: 'Non pronto' },
                    bonus10: { canPress: false, reason: 'Non pronto' },
                    bonus20: { canPress: false, reason: 'Non pronto' }
                },
                costs: { base: 1, bonus5: 6, bonus10: 11, bonus20: 21 },
                currentWinner: null,
                isActive: false
            };
        }

        const currentRound = room.currentRound ?? null;
        const participant = room.participants[userKey];
        const presses = currentRound?.presses ?? {};
        const isActive = currentRound?.status !== 'FINISHED';

        const winner = getCurrentWinner(presses);

        // Calcola i costi per ogni bottone
        const baseCost = calculateRequiredPoints(presses, 1);
        const bonus5Cost = calculateRequiredPoints(presses, 5);
        const bonus10Cost = calculateRequiredPoints(presses, 10);
        const bonus20Cost = calculateRequiredPoints(presses, 20);

        // Verifica se puoi premere ogni bottone
        const canPressBase = canUserPress({ participant: participant && { ...participant, email: userKey }, presses, userKey, bonus: 1 });
        const canPressBonus5 = canUserPress({ participant: participant && { ...participant, email: userKey }, presses, userKey, bonus: 5 });
        const canPressBonus10 = canUserPress({ participant: participant && { ...participant, email: userKey }, presses, userKey, bonus: 10 });
        const canPressBonus20 = canUserPress({ participant: participant && { ...participant, email: userKey }, presses, userKey, bonus: 20 });

        return {
            round: currentRound,
            participant,
            canPressButtons: {
                base: canPressBase,
                bonus5: canPressBonus5,
                bonus10: canPressBonus10,
                bonus20: canPressBonus20
            },
            costs: {
                base: baseCost,
                bonus5: bonus5Cost,
                bonus10: bonus10Cost,
                bonus20: bonus20Cost
            },
            currentWinner: winner,
            isActive
        };
    }, [room, userKey]);

    if (loading) return <p className="p-4">Caricamento...</p>;
    if (!room) return <p className="p-4">Stanza non trovata.</p>;

    const { round, participant, canPressButtons, costs, currentWinner, isActive } = gameState;
    const pointsUsed = participant?.pointsUsed ?? 0;
    const pointsAvail = participant ? participant.pointsTotal - pointsUsed : 0;

    const isWinner = currentWinner?.userId === userKey;

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50">
                <ConnectionStatus />
                <main className="container mx-auto px-4 py-8 space-y-6">
                    <header className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">Stanza {roomCode}</h1>
                            <p className="text-sm text-gray-500">
                                Punti disponibili: <span className="font-semibold">{pointsAvail}</span>
                            </p>
                        </div>
                    </header>

                    <Card className="flex flex-col items-center gap-6">
                        <QuestionDisplay round={round} />

                        {round && isActive && (
                            <Timer
                                remainingMs={Math.max(0, Number(round.startTs) + round.timerMs - Date.now())}
                                totalMs={round.timerMs}
                            />
                        )}

                        {isWinner && (
                            <div className="rounded-lg bg-green-100 px-4 py-2 text-green-800 font-semibold">
                                🏆 Sei il vincitore attuale!
                            </div>
                        )}

                        {currentWinner && !isWinner && (
                            <div className="text-sm text-gray-600">
                                Vincitore attuale: {currentWinner.userId.split('_dot_')[0]} ({currentWinner.pointsUsed} punti)
                            </div>
                        )}

                        <div className="flex flex-col items-center gap-4">
                            <Buzzer
                                disabled={!round || !isActive || !canPressButtons.base.canPress}
                                label={costs.base.toString()}
                                onPress={() => press(1)}
                            />
                            {!canPressButtons.base.canPress && (
                                <p className="text-xs text-red-500">
                                    {canPressButtons.base.reason ?? 'Non puoi premere ora.'}
                                </p>
                            )}

                            <div className="flex gap-2">
                                <MiniBuzzer
                                    bonus={5}
                                    disabled={!round || !isActive || !canPressButtons.bonus5.canPress}
                                    cost={costs.bonus5}
                                    onPress={() => press(5)}
                                />
                                <MiniBuzzer
                                    bonus={10}
                                    disabled={!round || !isActive || !canPressButtons.bonus10.canPress}
                                    cost={costs.bonus10}
                                    onPress={() => press(10)}
                                />
                                <MiniBuzzer
                                    bonus={20}
                                    disabled={!round || !isActive || !canPressButtons.bonus20.canPress}
                                    cost={costs.bonus20}
                                    onPress={() => press(20)}
                                />
                            </div>
                        </div>
                    </Card>

                    <WinnerModal room={room} />
                </main>
            </div>
        </>
    );
}