import { ref } from 'firebase/database';
import { db } from './firebase';

export function sanitizeEmailKey(email: string): string {
    return email
        .toLowerCase()
        .replace(/\./g, '_dot_')
        .replace(/\$/g, '_dollar_')
        .replace(/#/g, '_hash_')
        .replace(/\[/g, '_lbracket_')
        .replace(/\]/g, '_rbracket_')
        .replace(/\//g, '_slash_');
}

export function desanitizeEmailKey(key: string): string {
    return key
        .replace(/_dot_/g, '.')
        .replace(/_dollar_/g, '$')
        .replace(/_hash_/g, '#')
        .replace(/_lbracket_/g, '[')
        .replace(/_rbracket_/g, ']')
        .replace(/_slash_/g, '/');
}

const MASTER_TOKEN_PREFIX = 'masterToken_';

export function generateMasterToken(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function getMasterToken(roomCode: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(MASTER_TOKEN_PREFIX + roomCode);
}

export function setMasterToken(roomCode: string, token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(MASTER_TOKEN_PREFIX + roomCode, token);
}

export function clearMasterToken(roomCode: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(MASTER_TOKEN_PREFIX + roomCode);
}

export const masterRef = (emailKey: string) => ref(db, `masters/${emailKey}`);
export const roomRef = (roomCode: string) => ref(db, `rooms/${roomCode}`);
export const participantsRef = (roomCode: string) =>
    ref(db, `rooms/${roomCode}/participants`);
export const participantRef = (roomCode: string, userKey: string) =>
    ref(db, `rooms/${roomCode}/participants/${userKey}`);
export const currentRoundRef = (roomCode: string) =>
    ref(db, `rooms/${roomCode}/currentRound`);
export const pressesRef = (roomCode: string) =>
    ref(db, `rooms/${roomCode}/currentRound/presses`);
export const pressRef = (roomCode: string, userKey: string) =>
    ref(db, `rooms/${roomCode}/currentRound/presses/${userKey}`);
export const settingsRef = (roomCode: string) =>
    ref(db, `rooms/${roomCode}/settings`);
