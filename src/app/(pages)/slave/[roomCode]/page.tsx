'use client';

import { useTimer } from '@/app/hooks/useTimer';
import { ConnectionStatus } from '@/app/components/shared/ConnectionStatus';
import Header from '@/app/components/shared/Header';
import { Buzzer } from '@/app/components/slave/Buzzer';
import { MiniBuzzer } from '@/app/components/slave/MiniBuzzer';
import { QuestionDisplay } from '@/app/components/slave/QuestionDisplay';
import { WinnerModal } from '@/app/components/slave/WinnerModal';
import { UserDropdown } from '@/app/components/shared/UserDropdown';
import { Card } from '@/app/components/ui/Card';
import { Timer } from '@/app/components/ui/Timer';
import { ParticipantsTable } from '@/app/components/master/PartecipantsTable';
import { Button } from '@/app/components/ui/Button';
import { useBuzzer } from '@/app/hooks/useBuzzer';
import { usePageLeave } from '@/app/hooks/useLeave';
import { useRoom } from '@/app/hooks/useRoom';
import { db } from '@/app/lib/firebase';
import { canUserBid, getCurrentWinner, getCumulativeBid, getMinimumToOutbid } from '@/app/lib/game-logic';
import { useRoomStore } from '@/app/store/roomStore';
import { ref, update } from 'firebase/database';
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
        localStorage.removeItem(`userEmail_${roomCode}`);
        router.push('/');
    };

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

    if (loading) return <p className="p-4">Caricamento...</p>;
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
            <Header />
            <div className="min-h-screen bg-gray-50">
                <ConnectionStatus />
                <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
                    {/* Header with user info */}
                    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Partecipante</h1>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                                    <span>💰 Budget: <strong className="text-green-600">{pointsAvail}</strong></span>
                                    {isActive && userCumulativeBid > 0 && (
                                        <span>🎯 Puntata nel round: <strong className="text-orange-600">{userCumulativeBid}</strong></span>
                                    )}
                                    {isActive && (
                                        <span>📊 Rimanenti: <strong className="text-blue-600">{pointsRemaining}</strong></span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {room.name || 'Stanza'}: {roomCode}
                            </div>
                            <UserDropdown
                                name={participantName}
                                email={userKey ?? ''}
                                onLogout={handleLogout}
                            />
                        </div>
                    </header>

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
                                <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-6 py-3 text-center w-full max-w-sm">
                                    <p className="text-sm text-yellow-700">
                                        <span className="font-semibold">
                                            {room.participants?.[currentWinner.userId]?.name || 'Qualcuno'}
                                        </span>{' '}
                                        sta vincendo con{' '}
                                        <span className="font-bold">{currentWinner.cumulativeBid}</span> punti
                                    </p>
                                </div>
                            )}

                            {isWinner && (
                                <div className="rounded-lg bg-green-100 px-6 py-3 text-green-800 font-semibold text-center animate-pulse">
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
                                    <label className="block text-sm font-medium text-gray-600 text-center">
                                        Puntata personalizzata
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            min={minimumCustomBid}
                                            max={maxCustomBid}
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(Math.max(1, Number(e.target.value)))}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
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
                                        <p className="text-xs text-gray-500 text-center">
                                            Devi puntare almeno {minimumCustomBid} punti per superare il vincitore
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Participants Table */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Partecipanti</h3>
                        <ParticipantsTable room={room} />
                    </Card>

                    <WinnerModal room={room} />
                </main>
            </div>
        </>
    );
}
