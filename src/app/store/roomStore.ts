'use client';

import { create } from 'zustand';
import { Room } from '../types';
import { sanitizeEmailKey } from '../lib/firebase-utils';

export type UserRole = 'master' | 'slave' | 'spectator' | null;

interface RoomStoreState {
    room: Room | null;
    roomCode: string | null;
    userKey: string | null;
    role: UserRole;
    setRoom: (room: Room | null) => void;
    setRoomCode: (code: string | null) => void;
    setUserKey: (key: string) => void;
    setRole: (role: UserRole) => void;
}

export const useRoomStore = create<RoomStoreState>((set) => ({
    room: null,
    roomCode: null,
    userKey: null,
    role: null,
    setRoom: (room) => set({ room }),
    setRoomCode: (roomCode) => set({ roomCode }),
    setUserKey: (userKey) => set({ userKey: sanitizeEmailKey(userKey) }),
    setRole: (role) => set({ role })
}));
