'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { db } from '@/app/lib/firebase';
import { Room, Round } from '@/app/types';
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

    /* ---------------------------------------------
       LISTENER REALTIME + TIMER SYNC
    --------------------------------------------- */
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
            intervalRef.current = setInterval(tick, 50); // refresh veloce per ms
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

    /* ---------------------------------------------
       AUTO FINE ROUND (SOLO MASTER)
    --------------------------------------------- */
    useEffect(() => {
        if (timeLeftMs === null || timeLeftMs > 0) return;
        if (room.currentRound?.status !== 'IN_PROGRESS') return;

        finishRound();
    }, [timeLeftMs]);

    /* ---------------------------------------------
       START ROUND
    --------------------------------------------- */
    const startRound = async () => {
        if (!questionText.trim()) return;

        const newRound: Round = {
            questionText,
            maxPoints: 0,
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

    /* ---------------------------------------------
       FINISH ROUND
    --------------------------------------------- */
    const finishRound = async () => {
        const round = room.currentRound;
        if (!round) return;

        const presses = round.presses ?? {};
        const entries = Object.values(presses).sort(
            (a: any, b: any) => a.serverTs - b.serverTs
        );
        const winner = entries[0]?.userId;

        const updates: Record<string, any> = {
            'currentRound/status': 'FINISHED',
            'currentRound/endTs': Date.now(),
            updatedAt: Date.now()
        };

        if (winner) {
            const participant = room.participants[winner];
            if (participant) {
                updates['currentRound/winner'] = winner;
                updates['currentRound/winnerPoints'] = round.maxPoints;
                updates[`participants/${winner}/roundsWon`] = [
                    ...(participant.roundsWon ?? []),
                    {
                        questionText: round.questionText,
                        pointsAwarded: round.maxPoints,
                        timestamp: Date.now()
                    }
                ];
            }
        }

        await update(ref(db, `rooms/${roomCode}`), updates);
    };

    /* ---------------------------------------------
       RESET ROUND (RICOMINCIA)
    --------------------------------------------- */
    const resetRound = async () => {
        await update(ref(db, `rooms/${roomCode}`), {
            currentRound: null,
            updatedAt: Date.now()
        });

        lastStartTsRef.current = null;
        setTimeLeftMs(null);
        setIsRunning(false);
    };

    /* ---------------------------------------------
       FORMAT TIMER (mm:ss.mmm)
    --------------------------------------------- */
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const millis = ms % 1000;

        return `${minutes}:${seconds
            .toString()
            .padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
    };

    /* ---------------------------------------------
       UI
    --------------------------------------------- */
    if (!currentRound) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Nuovo Round</h3>
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
                        className={`font-mono text-xl font-bold ${timeLeftMs <= 5000 ? 'text-red-600' : ''
                            }`}
                    >
                        {formatTime(timeLeftMs)}
                    </span>
                )}
            </div>

            {/* BOTTONI */}
            {currentRound.status === 'IN_PROGRESS' && (
                <Button variant="secondary" onClick={finishRound}>
                    Chiudi Round
                </Button>
            )}

            {currentRound.status === 'FINISHED' && (
                <Button onClick={resetRound}>
                    Ricomincia Round
                </Button>
            )}
        </div>
    );
}
