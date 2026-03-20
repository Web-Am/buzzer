'use client';

import { useEffect, useState } from 'react';

export function useTimer(startTs: number | null | undefined, durationMs: number | null | undefined) {
    const [remaining, setRemaining] = useState<number>(durationMs ?? 0);

    useEffect(() => {
        if (!startTs || !durationMs) return;

        const tick = () => {
            const now = Date.now();
            const elapsed = now - (startTs as number);
            const rem = Math.max((durationMs as number) - elapsed, 0);
            setRemaining(rem);
        };

        tick();
        const id = setInterval(tick, 50); // Aggiornamento ogni 50ms per sincronizzazione ottimale

        return () => clearInterval(id);
    }, [startTs, durationMs]);

    return { remaining, remainingSeconds: Math.ceil(remaining / 1000) };
}
