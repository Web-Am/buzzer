import { Round } from './round';

export type RoomState =
    | 'NOT_CREATED'
    | 'WAITING'
    | 'ROUND_ACTIVE'
    | 'ROUND_FINISHED'
    | 'CLOSED';

export interface RoomSettings {
    totalPoints: number;
    timerCountdown: number; // ms
}

export interface RoundWon {
    questionText: string;
    pointsAwarded: number;
    timestamp: number;
}

export interface Participant {
    name: string;
    isOnline: boolean;
    pointsTotal: number;
    pointsUsed: number;
    roundsWon: RoundWon[];
}

export interface Room {
    masterEmail: string;
    createdAt: number;
    updatedAt: number;
    settings: RoomSettings;
    participants: Record<string, Participant>;
    currentRound: Round | null;
}
