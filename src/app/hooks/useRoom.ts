'use client';

import { useEffect, useState } from 'react';
import { onValue, off } from 'firebase/database';
import { roomRef } from '../lib/firebase-utils';
import { useRoomStore } from '../store/roomStore';
import { Room, Participant } from '../types';

export function useRoom(roomCode: string | null) {
    const [loading, setLoading] = useState(true);
    const { setRoom } = useRoomStore();

    useEffect(() => {
        if (!roomCode) return;

        const ref = roomRef(roomCode);

        const unsubscribe = onValue(
            ref,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val() as Room;

                    if (data.participants) {
                        Object.keys(data.participants).forEach((key) => {
                            const p = data.participants[key] as Participant;
                            // Ricalcola pointsUsed basato su roundsWon
                            if (p.roundsWon && p.roundsWon.length > 0) {
                                const totalSpent = p.roundsWon.reduce((sum, round) => {
                                    // Ogni round rappresenta una spesa (pointsAwarded è ciò che hai speso per vincere)
                                    return sum + (round.pointsAwarded || 0);
                                }, 0);
                                p.pointsUsed = totalSpent;
                            } else {
                                p.pointsUsed = p.pointsUsed || 0;
                            }
                        });
                    }

                    setRoom(data);
                } else {
                    setRoom(null);
                }

                setLoading(false);
            },
            (error) => {
                console.error('Firebase listener error:', error);
                setLoading(false);
            }
        );

        return () => {
            off(ref);
            unsubscribe();
        };
    }, [roomCode, setRoom]);

    return { loading };
}
