export type RoundStatus = 'IN_PROGRESS' | 'FINISHED';

export interface Press {
    userId: string;
    value: number; // punti aggiunti in questa press (incremento)
    cumulativeBid: number; // totale cumulativo del giocatore nel round
    serverTs: number;
    pointsUsed: number; // = value (costo di questa press)
}

export interface Round {
    questionText: string;
    status: RoundStatus;
    startTs: number;
    endTs?: number;
    timerMs: number;
    presses: Record<string, Press>;
    winner?: string;
    winnerPoints?: number;
}
