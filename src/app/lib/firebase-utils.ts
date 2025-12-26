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
