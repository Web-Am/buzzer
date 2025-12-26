'use client';

import { useEffect, useState } from 'react';

export function useTimer(startTs: number | null, durationMs: number | null) {
    const [remaining, setRemaining] = useState<number>(durationMs ?? 0);

    useEffect(() => {
        if (!startTs || !durationMs) return;

        const tick = () => {
            const now = Date.now();
            const elapsed = now - startTs;
            const rem = Math.max(durationMs - elapsed, 0);
            setRemaining(rem);
        };

        tick();
        const id = setInterval(tick, 100);

        return () => clearInterval(id);
    }, [startTs, durationMs]);

    return { remaining, remainingSeconds: Math.ceil(remaining / 1000) };
}
