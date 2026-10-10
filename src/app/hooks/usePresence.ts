'use client';

import { useEffect } from 'react';
import { onDisconnect, onValue, ref, runTransaction, serverTimestamp } from 'firebase/database';
import { db } from '../lib/firebase';
import { participantRef } from '../lib/firebase-utils';

const HEARTBEAT_INTERVAL_MS = 60_000;

export function usePresence(roomCode: string | null, userKey: string | null) {
    useEffect(() => {
        if (!roomCode || !userKey) return;

        const presenceRef = participantRef(roomCode, userKey);
        const connectedRef = ref(db, '.info/connected');

        const touch = (current: unknown) => {
            if (current === null) return;
            return { ...(current as object), isOnline: true, updatedAt: Date.now() };
        };

        const markOnline = async () => {
            const result = await runTransaction(presenceRef, touch);
            if (result.committed) {
                onDisconnect(presenceRef)
                    .update({ isOnline: false, updatedAt: serverTimestamp() })
                    .catch(() => {});
            }
        };

        const unsubscribe = onValue(connectedRef, (snapshot) => {
            if (snapshot.val() === true) {
                markOnline();
            }
        });

        const heartbeat = setInterval(() => {
            runTransaction(presenceRef, touch).catch(() => {});
        }, HEARTBEAT_INTERVAL_MS);

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                markOnline();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(heartbeat);
            document.removeEventListener('visibilitychange', handleVisibility);
            unsubscribe();
            onDisconnect(presenceRef).cancel().catch(() => {});
            runTransaction(presenceRef, (current) => {
                if (current === null) return;
                return { ...(current as object), isOnline: false, updatedAt: Date.now() };
            }).catch(() => {});
        };
    }, [roomCode, userKey]);
}
