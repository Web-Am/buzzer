import { Press } from '../types';

export interface CanPressResult {
    canPress: boolean;
    reason?: string;
    requiredPoints?: number;
}

// ===== UTILITY FUNCTIONS =====

export function generateRoomCode(length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export function calculatePointsUsed(participant: {
    pointsTotal: number;
    pointsUsed: number;
    roundsWon?: Array<{ pointsAwarded: number }>;
}): number {
    if (!participant.roundsWon?.length) return participant.pointsUsed || 0;
    return participant.roundsWon.reduce((sum, r) => sum + r.pointsAwarded, 0);
}

export function getPointsAvailable(participant: {
    pointsTotal: number;
    pointsUsed: number;
}): number {
    return participant.pointsTotal - participant.pointsUsed;
}

// ===== CUMULATIVE BID SYSTEM =====

export function getCumulativeBid(presses: Record<string, Press> | undefined, userKey: string): number {
    if (!presses || !presses[userKey]) return 0;
    return presses[userKey].cumulativeBid ?? presses[userKey].pointsUsed ?? 0;
}

export function getCurrentWinner(presses: Record<string, Press> | undefined): { userId: string; cumulativeBid: number } | null {
    if (!presses || Object.keys(presses).length === 0) {
        return null;
    }

    let maxBid = 0;
    let winnerId = '';
    let earliestTs = Infinity;

    Object.entries(presses).forEach(([userId, press]) => {
        const bid = press.cumulativeBid ?? press.pointsUsed ?? 0;
        if (bid > maxBid || (bid === maxBid && press.serverTs < earliestTs)) {
            maxBid = bid;
            winnerId = userId;
            earliestTs = press.serverTs;
        }
    });

    return winnerId ? { userId: winnerId, cumulativeBid: maxBid } : null;
}

export function calculateBidCost(
    userCumulativeBid: number,
    winnerCumulativeBid: number,
    increment: number
): number {
    const minimumToOutbid = userCumulativeBid === 0
        ? increment // first bid: use the increment directly
        : (winnerCumulativeBid - userCumulativeBid) + increment;

    return Math.max(minimumToOutbid, 1);
}

export function getMinimumToOutbid(
    userCumulativeBid: number,
    winnerCumulativeBid: number
): number {
    if (userCumulativeBid === 0) return 1;
    return winnerCumulativeBid - userCumulativeBid + 1;
}

export function canUserBid(params: {
    participant: {
        pointsTotal: number;
        pointsUsed: number;
        isViewer?: boolean;
    } | undefined;
    presses: Record<string, Press> | undefined;
    userKey: string;
    increment: number;
}): CanPressResult {
    const { participant, presses, userKey, increment } = params;

    if (!participant) {
        return { canPress: false, reason: 'Partecipante non trovato' };
    }

    if (participant.isViewer) {
        return { canPress: false, reason: 'Gli spettatori non possono votare' };
    }

    const winner = getCurrentWinner(presses);

    if (winner && winner.userId === userKey) {
        return {
            canPress: false,
            reason: 'Sei già il vincitore attuale',
            requiredPoints: 0
        };
    }

    const userCumulativeBid = getCumulativeBid(presses, userKey);
    const winnerCumulativeBid = winner?.cumulativeBid ?? 0;

    const pointsAvailable = participant.pointsTotal - participant.pointsUsed;

    if (userCumulativeBid === 0) {
        // First bid: cost = increment
        const cost = increment;
        if (pointsAvailable < cost) {
            return {
                canPress: false,
                reason: `Servono ${cost} punti (ne hai ${pointsAvailable})`,
                requiredPoints: cost
            };
        }
        return { canPress: true, requiredPoints: cost };
    }

    const remainingBudget = pointsAvailable - userCumulativeBid;
    const minimumToOutbid = winnerCumulativeBid - userCumulativeBid + increment;

    if (remainingBudget < minimumToOutbid) {
        return {
            canPress: false,
            reason: `Servono almeno ${minimumToOutbid} punti (ne hai ${remainingBudget + userCumulativeBid} disponibili)`,
            requiredPoints: minimumToOutbid
        };
    }

    return { canPress: true, requiredPoints: minimumToOutbid };
}

// ===== VALIDATION FUNCTIONS =====

export function validateRoomCreation(data: {
    name: string;
    roomName: string;
    email: string;
    totalPoints: number;
    timerCountdown: number;
}): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!data.roomName || data.roomName.trim().length < 2) {
        errors.roomName = 'Il nome stanza deve avere almeno 2 caratteri.';
    }

    if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Il tuo nome deve avere almeno 2 caratteri.';
    }

    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
        errors.email = 'Inserisci una email valida.';
    }

    if (data.totalPoints < 100) {
        errors.totalPoints = 'Punti totali troppo bassi.';
    }

    if (data.timerCountdown < 3000) {
        errors.timerCountdown = 'Il timer deve essere almeno 3 secondi.';
    }

    return { valid: Object.keys(errors).length === 0, errors };
}

export function validateJoinRoom(data: {
    roomCode: string;
    name: string;
    email: string;
}): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!data.roomCode || data.roomCode.trim().length !== 6) {
        errors.roomCode = 'Il codice stanza deve avere 6 caratteri.';
    }

    if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Il nome deve avere almeno 2 caratteri.';
    }

    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
        errors.email = 'Inserisci una email valida.';
    }

    return { valid: Object.keys(errors).length === 0, errors };
}

// Legacy aliases for backward compatibility
export const calculateRequiredPoints = calculateBidCost;
export const canUserPress = canUserBid;
export const calculateBasePressValue = (p: Record<string, Press> | undefined) => 1;
