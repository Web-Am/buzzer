'use client';

import { get, ref, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { sanitizeEmailKey } from '../lib/firebase-utils';
import { generateRoomCode } from '../lib/game-logic';
import { useUIStore } from '../store/uiStore';
import { Room } from '../types';

export function useCreateRoom() {

    const { setIsCreatingRoom } = useUIStore();

    async function createRoom(data: { name: string; email: string; totalPoints: number; timerCountdown: number; }): Promise<string | null> {

        setIsCreatingRoom(true);

        try {
            const masterEmailKey = sanitizeEmailKey(data.email);

            // 🔍 Controllo se esiste già un master
            const masterRef = ref(db, `masters/${masterEmailKey}`);
            const masterSnap = await get(masterRef);

            if (masterSnap.exists()) {
                return masterSnap.val().room;
            }

            let roomCode = '';
            let attempts = 0;
            let roomSnap;

            do {
                roomCode = generateRoomCode();
                roomSnap = await get(ref(db, `rooms/${roomCode}`));
                attempts++;
            } while (roomSnap.exists() && attempts < 3);

            if (roomSnap.exists()) {
                throw new Error('Failed to generate unique room code');
            }

            const now = Date.now();

            const roomData: Room = {
                masterEmail: masterEmailKey,
                createdAt: now,
                updatedAt: now,
                settings: {
                    totalPoints: data.totalPoints,
                    timerCountdown: data.timerCountdown
                },
                participants: {},
                currentRound: null
            };

            await set(ref(db, `rooms/${roomCode}`), roomData);
            await set(ref(db, `masters/${masterEmailKey}`), {
                room: roomCode,
                name: data.name,
                updatedAt: now
            });

            return roomCode;

        } catch (err) {
            console.error('createRoom error', err);
            return null;
        } finally {
            setIsCreatingRoom(false);
        }
    }


    return { createRoom };
}
