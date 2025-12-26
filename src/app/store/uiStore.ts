'use client';

import { create } from 'zustand';

interface UIState {
    isCreatingRoom: boolean;
    isJoiningRoom: boolean;
    isPressingBuzzer: boolean;
    setIsCreatingRoom: (v: boolean) => void;
    setIsJoiningRoom: (v: boolean) => void;
    setIsPressingBuzzer: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isCreatingRoom: false,
    isJoiningRoom: false,
    isPressingBuzzer: false,
    setIsCreatingRoom: (v) => set({ isCreatingRoom: v }),
    setIsJoiningRoom: (v) => set({ isJoiningRoom: v }),
    setIsPressingBuzzer: (v) => set({ isPressingBuzzer: v })
}));
