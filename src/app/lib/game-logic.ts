// app/lib/game-logic.ts

export interface Press {
    userId: string;
    pointsUsed: number;
    serverTs: number;
    targetText: string;
    value: number;
}

export interface Participant {
    email: string;
    pointsTotal: number;
    pointsUsed: number;
    isOnline: boolean;
    roundsWon?: Array<{ pointsAwarded: number }>;
}

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

/**
 * Determina il vincitore in base al primo che ha premuto (logica originale per fine round)
 */
export function determineWinner(presses: Record<string, Press>): string | null {
    const keys = Object.keys(presses);
    if (keys.length === 0) return null;

    const sorted = Object.values(presses).sort((a, b) => a.serverTs - b.serverTs);
    return sorted[0].userId;
}

export function calculatePointsUsed(participant: Participant): number {
    if (!participant.roundsWon?.length) return 0;
    return participant.roundsWon.reduce((sum, r) => sum + r.pointsAwarded, 0);
}

export function getPointsAvailable(participant: Participant): number {
    return participant.pointsTotal - participant.pointsUsed;
}

// ===== WINNER LOGIC (NEW SYSTEM) =====

/**
 * Trova il vincitore attuale del round durante il gioco (chi ha usato più punti)
 */
export function getCurrentWinner(presses: Record<string, Press>): { userId: string; pointsUsed: number } | null {
    if (!presses || Object.keys(presses).length === 0) {
        return null;
    }

    let maxPoints = 0;
    let winnerId = '';

    Object.entries(presses).forEach(([userId, press]) => {
        if (press.pointsUsed > maxPoints) {
            maxPoints = press.pointsUsed;
            winnerId = userId;
        }
    });

    return winnerId ? { userId: winnerId, pointsUsed: maxPoints } : null;
}

/**
 * Calcola i punti necessari per buzzare
 * - Se non c'è nessun vincitore: bonus (1, 5, 10, 20)
 * - Se c'è un vincitore: punti del vincitore + bonus
 */
export function calculateRequiredPoints(
    presses: Record<string, Press> | undefined,
    bonus: number = 1
): number {
    if (!presses) return bonus;

    const winner = getCurrentWinner(presses);

    if (!winner) {
        // Nessuno ha ancora premuto, costo = bonus
        return bonus;
    }

    // Per superare il vincitore attuale
    return winner.pointsUsed + bonus;
}

/**
 * Calcola il costo base del buzzer (sempre uguale al costo per superare + 1)
 */
export function calculateBasePressValue(presses: Record<string, Press> | undefined): number {
    return calculateRequiredPoints(presses, 1);
}

/**
 * Verifica se l'utente può premere il buzzer (NEW LOGIC)
 */
export function canUserPress(params: {
    participant: Participant | undefined;
    presses: Record<string, Press> | undefined;
    userKey: string;
    bonus: number;
}): CanPressResult {
    const { participant, presses, userKey, bonus } = params;

    if (!participant) {
        return { canPress: false, reason: 'Partecipante non trovato' };
    }

    const pointsAvailable = getPointsAvailable(participant);
    const requiredPoints = calculateRequiredPoints(presses, bonus);

    // Verifica se hai abbastanza punti
    if (pointsAvailable < requiredPoints) {
        return {
            canPress: false,
            reason: `Servono ${requiredPoints} punti (ne hai ${pointsAvailable})`,
            requiredPoints
        };
    }

    const winner = getCurrentWinner(presses || {});

    // Se sei già il vincitore, non puoi premere di nuovo
    if (winner && winner.userId === userKey) {
        return {
            canPress: false,
            reason: 'Sei già il vincitore attuale',
            requiredPoints
        };
    }

    // Puoi premere!
    return { canPress: true, requiredPoints };
}

// ===== VALIDATION FUNCTIONS =====

export function validateRoomCreation(data: {
    name: string;
    email: string;
    totalPoints: number;
    timerCountdown: number;
}): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Il nome deve avere almeno 2 caratteri.';
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