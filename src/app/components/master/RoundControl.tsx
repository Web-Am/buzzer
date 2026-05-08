'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { db } from '@/app/lib/firebase';
import { Room, Round } from '@/app/types';
import { getCurrentWinner } from '@/app/lib/game-logic';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Props {
    roomCode: string;
    room: Room;
}

export function RoundControl({ roomCode, room }: Props) {
    const [questionText, setQuestionText] = useState('');
    const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastStartTsRef = useRef<number | null>(null);

    const currentRound = room.currentRound;

    useEffect(() => {
        if (!roomCode) return;

        const roundRef = ref(db, `rooms/${roomCode}/currentRound`);

        const unsubscribe = onValue(roundRef, (snapshot) => {
            const round: Round | null = snapshot.val();

            if (!round || round.status !== 'IN_PROGRESS' || !round.startTs) {
                stopTimer();
                setTimeLeftMs(null);
                return;
            }

            if (lastStartTsRef.current === round.startTs) return;
            lastStartTsRef.current = round.startTs;

            const tick = () => {
                const elapsed = Date.now() - round.startTs!;
                const remaining = Math.max(0, round.timerMs - elapsed);
                setTimeLeftMs(remaining);

                if (remaining <= 0) {
                    stopTimer();
                }
            };

            stopTimer();
            setIsRunning(true);
            tick();
            intervalRef.current = setInterval(tick, 50);
        });

        return () => {
            unsubscribe();
            stopTimer();
        };
    }, [roomCode]);

    const stopTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
    };

    // Auto-finish when timer reaches 0
    useEffect(() => {
        if (timeLeftMs === null || timeLeftMs > 0) return;
        if (room.currentRound?.status !== 'IN_PROGRESS') return;

        finishRound();
    }, [timeLeftMs]);

    const startRound = async () => {
        if (!questionText.trim()) return;

        const newRound: Round = {
            questionText,
            status: 'IN_PROGRESS',
            startTs: Date.now(),
            timerMs: room.settings.timerCountdown,
            presses: {}
        };

        await update(ref(db, `rooms/${roomCode}`), {
            currentRound: newRound,
            updatedAt: Date.now()
        });

        setQuestionText('');
    };

    const finishRound = async () => {
        const round = room.currentRound;
        if (!round) return;

        const presses = round.presses ?? {};
        const winner = getCurrentWinner(presses);

        const updates: Record<string, any> = {
            'currentRound/status': 'FINISHED',
            'currentRound/endTs': Date.now(),
            updatedAt: Date.now()
        };

        if (winner) {
            updates['currentRound/winner'] = winner.userId;
            updates['currentRound/winnerPoints'] = winner.cumulativeBid;

            // Save winner in roundsWon history
            const winnerParticipant = room.participants?.[winner.userId];
            if (winnerParticipant) {
                updates[`participants/${winner.userId}/roundsWon`] = [
                    ...(winnerParticipant.roundsWon ?? []),
                    {
                        questionText: round.questionText,
                        pointsAwarded: winner.cumulativeBid,
                        timestamp: Date.now()
                    }
                ];

                // Only the winner loses points
                const newPointsUsed = (winnerParticipant.pointsUsed || 0) + winner.cumulativeBid;
                updates[`participants/${winner.userId}/pointsUsed`] = newPointsUsed;
            }
        }

        await update(ref(db, `rooms/${roomCode}`), updates);
    };

    const resetRound = async () => {
        await update(ref(db, `rooms/${roomCode}`), {
            currentRound: null,
            updatedAt: Date.now()
        });

        lastStartTsRef.current = null;
        setTimeLeftMs(null);
        setIsRunning(false);
    };

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const millis = ms % 1000;

        return `${minutes}:${seconds
            .toString()
            .padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
    };

    if (!currentRound) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Nuovo Round</h3>
                <p className="text-sm text-gray-500">
                    Scrivi la domanda (solitamente un nome) e avvia il round.
                    I partecipanti hanno {room.settings.timerCountdown / 1000} secondi per votare.
                </p>
                <Input
                    label="Domanda"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                />
                <Button onClick={startRound} disabled={!questionText.trim()}>
                    Avvia Round
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Round attuale</h3>

            <p className="text-sm text-gray-700">
                {currentRound.questionText}
            </p>

            <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                    Stato:{' '}
                    {currentRound.status === 'IN_PROGRESS'
                        ? 'In corso'
                        : 'Finito'}
                </p>

                {isRunning && timeLeftMs !== null && (
                    <span
                        className={`font-mono text-xl font-bold ${timeLeftMs <= 3000 ? 'text-red-600' : ''
                            }`}
                    >
                        {formatTime(timeLeftMs)}
                    </span>
                )}
            </div>

            {currentRound.status === 'IN_PROGRESS' && (
                <Button variant="secondary" onClick={finishRound}>
                    Chiudi Round
                </Button>
            )}

            {currentRound.status === 'FINISHED' && (
                <Button onClick={resetRound}>
                    Nuovo Round
                </Button>
            )}
        </div>
    );
}
