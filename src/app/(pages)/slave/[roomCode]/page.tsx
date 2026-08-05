'use client';

import { useTimer } from '@/app/hooks/useTimer';
import { ConnectionStatus } from '@/app/components/shared/ConnectionStatus';
import SlaveHeader from '@/app/components/headers/SlaveHeader';
import { Buzzer } from '@/app/components/slave/Buzzer';
import { MiniBuzzer } from '@/app/components/slave/MiniBuzzer';
import { QuestionDisplay } from '@/app/components/slave/QuestionDisplay';
import { WinnerModal } from '@/app/components/slave/WinnerModal';
import { Card } from '@/app/components/ui/Card';
import { Timer } from '@/app/components/ui/Timer';
import { ParticipantsTable } from '@/app/components/master/PartecipantsTable';
import { Button } from '@/app/components/ui/Button';
import { useBuzzer } from '@/app/hooks/useBuzzer';
import { usePresence } from '@/app/hooks/usePresence';
import { useRoom } from '@/app/hooks/useRoom';
import { canUserBid, getCurrentWinner, getCumulativeBid, getMinimumToOutbid } from '@/app/lib/game-logic';
import { participantRef } from '@/app/lib/firebase-utils';
import { useRoomStore } from '@/app/store/roomStore';
import { update } from 'firebase/database';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function SlavePage() {
    const router = useRouter();
    const params = useParams<{ roomCode: string }>();
    const roomCode = params.roomCode;

    const { press, pressCustom } = useBuzzer(roomCode);
    const { loading } = useRoom(roomCode);
    const { room, setRoomCode, setRole, userKey, setUserKey } = useRoomStore();

    const [customAmount, setCustomAmount] = useState<number>(1);

    const currentRound = room?.currentRound ?? null;
    const { remaining: timerRemaining } = useTimer(
        currentRound?.startTs ?? null,
        currentRound?.timerMs ?? null
    );

    const handleLogout = () => {
        if (userKey && roomCode) {
            update(participantRef(roomCode, userKey), { isOnline: false }).catch(() => {});
        }
        localStorage.removeItem(`userEmail_${roomCode}`);
        router.push('/');
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

    usePresence(roomCode, userKey);

    const gameState = useMemo(() => {
        if (!room || !userKey) {
            return {
                round: null,
                participant: undefined,
                canPressButtons: {
                    bid1: { canPress: false, reason: 'Non pronto', requiredPoints: 0 },
                    bid5: { canPress: false, reason: 'Non pronto', requiredPoints: 0 },
                    bid20: { canPress: false, reason: 'Non pronto', requiredPoints: 0 },
                    custom: { canPress: false, reason: 'Non pronto', requiredPoints: 0 }
                },
                costs: { bid1: 1, bid5: 5, bid20: 20, custom: 1 },
                currentWinner: null,
                userCumulativeBid: 0,
                isActive: false
            };
        }

        const currentRound = room.currentRound ?? null;
        const participant = room.participants?.[userKey];
        const presses = currentRound?.presses ?? {};
        const isActive = currentRound?.status !== 'FINISHED';

        const winner = getCurrentWinner(presses);
        const userCumulativeBid = getCumulativeBid(presses, userKey);

        const canPressBid1 = canUserBid({ participant, presses, userKey, increment: 1 });
        const canPressBid5 = canUserBid({ participant, presses, userKey, increment: 5 });
        const canPressBid20 = canUserBid({ participant, presses, userKey, increment: 20 });
        const canPressCustom = canUserBid({ participant, presses, userKey, increment: customAmount || 1 });

        return {
            round: currentRound,
            participant,
            canPressButtons: {
                bid1: canPressBid1,
                bid5: canPressBid5,
                bid20: canPressBid20,
                custom: canPressCustom
            },
            costs: {
                bid1: canPressBid1.requiredPoints ?? 1,
                bid5: canPressBid5.requiredPoints ?? 5,
                bid20: canPressBid20.requiredPoints ?? 20,
                custom: canPressCustom.requiredPoints ?? customAmount
            },
            currentWinner: winner,
            userCumulativeBid,
            isActive
        };
    }, [room, userKey, customAmount]);

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Caricamento...</p>
            </div>
        </div>
    );
    if (!room) return <p className="p-4">Stanza non trovata.</p>;

    const { round, participant, canPressButtons, costs, currentWinner, userCumulativeBid, isActive } = gameState;
    const pointsUsed = participant?.pointsUsed ?? 0;
    const pointsAvail = participant ? participant.pointsTotal - pointsUsed : 0;
    const pointsRemaining = participant ? (participant.pointsTotal - pointsUsed - userCumulativeBid) : 0;

    const isWinner = currentWinner?.userId === userKey;
    const participantName = participant?.name || 'Partecipante';

    const minimumCustomBid = userCumulativeBid === 0
        ? 1
        : Math.max(1, (currentWinner?.cumulativeBid ?? 0) - userCumulativeBid + 1);
    const maxCustomBid = pointsAvail - userCumulativeBid;

    return (
        <>
            <SlaveHeader
                roomCode={roomCode}
                roomName={room.name}
                userName={participantName}
                userEmail={userKey ?? ''}
                pointsAvail={pointsAvail}
                userCumulativeBid={userCumulativeBid}
                pointsRemaining={pointsRemaining}
                isActive={isActive}
                onLogout={handleLogout}
            />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <ConnectionStatus />
                <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">

                    {/* Game Area */}
                    <Card className="p-6">
                        <div className="flex flex-col items-center gap-6">
                            <QuestionDisplay round={round} />

                            {round && isActive && (
                                <Timer
                                    remainingMs={timerRemaining}
                                    totalMs={round.timerMs}
                                />
                            )}

                            {/* Current winner display */}
                            {currentWinner && isActive && (
                                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 px-6 py-3 text-center w-full max-w-sm">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                        <span className="font-semibold">
                                            {room.participants?.[currentWinner.userId]?.name || 'Qualcuno'}
                                        </span>{' '}
                                        sta vincendo con{' '}
                                        <span className="font-bold">{currentWinner.cumulativeBid}</span> crediti
                                    </p>
                                </div>
                            )}

                            {isWinner && (
                                <div className="rounded-lg bg-green-100 dark:bg-green-900/30 px-6 py-3 text-green-800 dark:text-green-300 font-semibold text-center animate-pulse">
                                    🏆 Sei il vincitore attuale!
                                </div>
                            )}

                            {/* Buzzer area */}
                            <div className="flex flex-col items-center gap-4">
                                {/* Main buzzer - +1 */}
                                <div className="relative">
                                    <Buzzer
                                        disabled={!round || !isActive || !canPressButtons.bid1.canPress}
                                        label={`+1 (${costs.bid1})`}
                                        onPress={() => press(1)}
                                    />
                                </div>

                                {/* Bonus buttons */}
                                <div className="flex gap-3 flex-wrap justify-center">
                                    <MiniBuzzer
                                        bonus={5}
                                        disabled={!round || !isActive || !canPressButtons.bid5.canPress}
                                        cost={costs.bid5}
                                        onPress={() => press(5)}
                                    />
                                    <MiniBuzzer
                                        bonus={20}
                                        disabled={!round || !isActive || !canPressButtons.bid20.canPress}
                                        cost={costs.bid20}
                                        onPress={() => press(20)}
                                    />
                                </div>

                                {/* Custom bid input */}
                                <div className="w-full max-w-xs space-y-2">
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
                                        Puntata personalizzata
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            min={minimumCustomBid}
                                            max={maxCustomBid}
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(Math.max(1, Number(e.target.value)))}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm outline-none dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                            disabled={!round || !isActive}
                                        />
                                        <Button
                                            disabled={!round || !isActive || !canPressButtons.custom.canPress}
                                            onClick={() => pressCustom(customAmount)}
                                            size="sm"
                                        >
                                            Punta
                                        </Button>
                                    </div>
                                    {!canPressButtons.custom.canPress && canPressButtons.custom.reason && (
                                        <p className="text-xs text-red-500 text-center">
                                            {canPressButtons.custom.reason}
                                        </p>
                                    )}
                                    {userCumulativeBid > 0 && (
                                        <p className="text-xs text-gray-500 dark:text-gray-300 text-center">
                                            Devi puntare almeno {minimumCustomBid} crediti per superare il vincitore
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Participants Table */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Partecipanti</h3>
                        <ParticipantsTable room={room} />
                    </Card>

                    <WinnerModal room={room} />
                </main>
            </div>
        </>
    );
}
