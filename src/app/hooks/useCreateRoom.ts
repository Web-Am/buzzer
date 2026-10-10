'use client';

import { get, ref, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { getMasterToken, generateMasterToken, masterRef, sanitizeEmailKey } from '../lib/firebase-utils';
import { generateRoomCode } from '../lib/game-logic';
import { useUIStore } from '../store/uiStore';
import { Room } from '../types';

export type CreateRoomResult =
    | { ok: true; roomCode: string; token: string }
    | { ok: false; error: string };

const EMAIL_IN_USE_ERROR = 'Questa email è già usata come Master. Se sei il Master accedi dal browser con cui hai creato la stanza, altrimenti usa un\'altra email.';

export function useCreateRoom() {

    const { setIsCreatingRoom } = useUIStore();

    async function createRoom(data: { name: string; email: string; totalPoints: number; timerCountdown: number; roomName: string; }): Promise<CreateRoomResult> {

        setIsCreatingRoom(true);

        try {
            const masterEmailKey = sanitizeEmailKey(data.email);
            const masterSnap = await get(masterRef(masterEmailKey));

            if (masterSnap.exists()) {
                const masterData = masterSnap.val() as { room: string; token?: string };
                const localToken = getMasterToken(masterData.room);

                if (masterData.token && localToken === masterData.token) {
                    return { ok: true, roomCode: masterData.room, token: masterData.token };
                }

                // Stanza master legacy senza token: backfill al primo accesso
                if (!masterData.token) {
                    const token = generateMasterToken();
                    await set(masterRef(masterEmailKey), { ...masterData, token, updatedAt: Date.now() });
                    return { ok: true, roomCode: masterData.room, token };
                }

                return { ok: false, error: EMAIL_IN_USE_ERROR };
            }

            // Se l'email è già registrata come OWNER in un'altra stanza (fallback legacy)
            const roomsSnap = await get(ref(db, `rooms`));
            if (roomsSnap.exists()) {
                const rooms = roomsSnap.val();
                for (const code of Object.keys(rooms)) {
                    if (rooms[code].masterEmail === masterEmailKey) {
                        const token = generateMasterToken();
                        await set(masterRef(masterEmailKey), {
                            room: code,
                            name: data.name,
                            token,
                            updatedAt: Date.now()
                        });
                        return { ok: true, roomCode: code, token };
                    }
                }
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
            const token = generateMasterToken();

            const roomData: Room = {
                name: data.roomName,
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
            await set(masterRef(masterEmailKey), {
                room: roomCode,
                name: data.name,
                token,
                updatedAt: now
            });

            return { ok: true, roomCode, token };

        } catch (err) {
            console.error('createRoom error', err);
            return { ok: false, error: 'Errore durante la creazione della stanza. Riprova.' };
        } finally {
            setIsCreatingRoom(false);
        }
    }


    return { createRoom };
}
