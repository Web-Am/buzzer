export type RoundStatus = 'IN_PROGRESS' | 'FINISHED';

export interface Press {
    userId: string;
    value: number; // numero progressivo press
    targetText: 'BUZZ' | '+5' | '+10' | '+20';
    serverTs: number;
    pointsUsed: number;
}

export interface Round {
    questionText: string;
    maxPoints: number;
    status: RoundStatus;
    startTs: number;
    endTs?: number;
    timerMs: number;
    presses: Record<string, Press>;
    winner?: string;
    winnerPoints?: number;
}
