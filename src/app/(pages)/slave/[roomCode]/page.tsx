'use client';

import { useTimer } from '@/app/hooks/useTimer';
import SlaveHeader from '@/app/components/headers/SlaveHeader';
import { Buzzer } from '@/app/components/slave/Buzzer';
import { MiniBuzzer } from '@/app/components/slave/MiniBuzzer';
import { QuestionDisplay } from '@/app/components/slave/QuestionDisplay';
import { Coins, Trophy } from 'lucide-react';
import { Card } from '@/app/components/ui/Card';
import { Timer } from '@/app/components/ui/Timer';
import { ParticipantsTable } from '@/app/components/master/PartecipantsTable';
import { Button } from '@/app/components/ui/Button';
import { useBuzzer } from '@/app/hooks/useBuzzer';
import { usePresence } from '@/app/hooks/usePresence';
import { useRoom } from '@/app/hooks/useRoom';
import { canUserBid, getCurrentWinner, getCumulativeBid } from '@/app/lib/game-logic';
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

    const currentWinnerBid = useMemo(() => {
        const presses = room?.currentRound?.presses;
        const winner = presses ? getCurrentWinner(presses) : null;
        return winner?.cumulativeBid ?? 0;
    }, [room]);

    useEffect(() => {
        setCustomAmount(Math.max(1, currentWinnerBid + 1));
    }, [currentWinnerBid]);

    const gameState = useMemo(() => {
        if (!room || !userKey) {
            return {
                round: null,
                participant: undefined,
                canPressButtons: {
                    bid1: { canPress: false, reason: 'Non pronto', requiredPoints: 0 },
                    bid5: { canPress: false, reason: 'Non pronto', requiredPoints: 0 },
                    bid10: { canPress: false, reason: 'Non pronto', requiredPoints: 0 }
                },
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
        const canPressBid10 = canUserBid({ participant, presses, userKey, increment: 10 });

        return {
            round: currentRound,
            participant,
            canPressButtons: {
                bid1: canPressBid1,
                bid5: canPressBid5,
                bid10: canPressBid10
            },
            currentWinner: winner,
            userCumulativeBid,
            isActive
        };
    }, [room, userKey]);

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Caricamento...</p>
            </div>
        </div>
    );
    if (!room) return <p className="p-4">Stanza non trovata.</p>;

    const { round, participant, canPressButtons, currentWinner, userCumulativeBid, isActive } = gameState;
    const pointsUsed = participant?.pointsUsed ?? 0;
    const pointsAvail = participant ? participant.pointsTotal - pointsUsed : 0;
    const pointsRemaining = participant ? (participant.pointsTotal - pointsUsed - userCumulativeBid) : 0;

    const isWinner = currentWinner?.userId === userKey;
    const participantName = participant?.name || 'Partecipante';

    const winnerCumulativeBid = currentWinner?.cumulativeBid ?? 0;
    const bid1Future = winnerCumulativeBid + 1;
    const bid5Future = winnerCumulativeBid + 5;
    const bid10Future = winnerCumulativeBid + 10;
    const minimumCustomBid = Math.max(1, winnerCumulativeBid + 1);
    const maxCustomBid = pointsAvail;
    const customAmountValid = customAmount >= minimumCustomBid && customAmount <= maxCustomBid;

    return (
        <>
            <SlaveHeader
                roomCode={roomCode}
                roomName={room.name}
                userName={participantName}
                userEmail={userKey ?? ''}
                onLogout={handleLogout}
            />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">

                    {/* Game Area */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 text-sm mb-4">
                            <span className="flex items-center gap-1.5 text-green-700 dark:text-green-200 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full font-semibold">
                                <Coins size={14} />
                                {pointsAvail}
                            </span>
                            {currentWinner && (
                                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-full font-semibold">
                                    <Trophy size={14} />
                                    {room.participants?.[currentWinner.userId]?.name ?? 'Qualcuno'}: {currentWinner.cumulativeBid}
                                </span>
                            )}
                        </div>
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
                                        {currentWinner.userId === userKey ? (
                                            <>
                                                Stai vincendo con{' '}
                                                <span className="font-bold">{currentWinner.cumulativeBid}</span>{' '}
                                                {currentWinner.cumulativeBid === 1 ? 'credito' : 'crediti'}
                                            </>
                                        ) : (
                                            <>
                                                <span className="font-semibold">
                                                    {room.participants?.[currentWinner.userId]?.name || 'Qualcuno'}
                                                </span>{' '}
                                                sta vincendo con{' '}
                                                <span className="font-bold">{currentWinner.cumulativeBid}</span>{' '}
                                                {currentWinner.cumulativeBid === 1 ? 'credito' : 'crediti'}
                                            </>
                                        )}
                                    </p>
                                </div>
                            )}

                            {!isActive && (
                                isWinner ? (
                                    <div className="text-center space-y-1.5">
                                        <div className="rounded-lg bg-green-100 dark:bg-green-900/30 px-6 py-3 text-green-800 dark:text-green-300 font-semibold text-center animate-pulse">
                                            🏆 Sei il vincitore!
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Hai speso <span className="font-bold">{round?.winnerPoints}</span> crediti
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-red-100 dark:bg-red-900/30 px-6 py-3 text-red-800 dark:text-red-300 font-semibold text-center">
                                        Hai perso il round!
                                    </div>
                                )
                            )}

                            {/* Buzzer area */}
                            {isActive && (
                            <div className="flex flex-col items-center gap-4">
                                {/* Main buzzer - +1 */}
                                <div className="relative">
                                    <Buzzer
                                        disabled={!round || !isActive || !canPressButtons.bid1.canPress}
                                        label={`+1 (${bid1Future})`}
                                        onPress={() => press(1)}
                                    />
                                </div>

                                {/* Bonus buttons */}
                                <div className="flex gap-3 flex-wrap justify-center">
                                    <MiniBuzzer
                                        bonus={5}
                                        disabled={!round || !isActive || !canPressButtons.bid5.canPress}
                                        cost={bid5Future}
                                        onPress={() => press(5)}
                                    />
                                    <MiniBuzzer
                                        bonus={10}
                                        disabled={!round || !isActive || !canPressButtons.bid10.canPress}
                                        cost={bid10Future}
                                        onPress={() => press(10)}
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
                                            disabled={!round || !isActive || isWinner || !customAmountValid}
                                            onClick={() => pressCustom(customAmount)}
                                            size="sm"
                                        >
                                            Punta
                                        </Button>
                                    </div>
                                    {!isWinner && (
                                        <p className={`text-xs text-center ${customAmount < minimumCustomBid ? 'text-red-500' : 'text-gray-500 dark:text-gray-300'}`}>
                                            Devi puntare almeno {minimumCustomBid} crediti per superare il vincitore
                                        </p>
                                    )}
                                </div>
                            </div>
                            )}
                        </div>
                    </Card>

                    {/* Participants Table */}
                    <Card className="p-6">
                        <ParticipantsTable room={room} />
                    </Card>
                </main>
            </div>
        </>
    );
}
