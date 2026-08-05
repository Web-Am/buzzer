'use client';

import { useEffect } from 'react';
import { onDisconnect, onValue, ref, serverTimestamp, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { participantRef } from '../lib/firebase-utils';

const HEARTBEAT_INTERVAL_MS = 60_000;

export function usePresence(roomCode: string | null, userKey: string | null) {
    useEffect(() => {
        if (!roomCode || !userKey) return;

        const presenceRef = participantRef(roomCode, userKey);
        const connectedRef = ref(db, '.info/connected');

        const markOnline = () => {
            update(presenceRef, { isOnline: true, updatedAt: Date.now() }).catch(() => {});
            onDisconnect(presenceRef)
                .update({ isOnline: false, updatedAt: serverTimestamp() })
                .catch(() => {});
        };

        const unsubscribe = onValue(connectedRef, (snapshot) => {
            if (snapshot.val() === true) {
                markOnline();
            }
        });

        const heartbeat = setInterval(() => {
            update(presenceRef, { isOnline: true, updatedAt: Date.now() }).catch(() => {});
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
        };
    }, [roomCode, userKey]);
}
