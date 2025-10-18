'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { ref, onValue, update, runTransaction, get, DataSnapshot, remove } from "firebase/database";
import { db } from "../lib/firebase";

/** Tipi */
export type Victory = { targetName: string; pointsUsed: number };

export type Player = {
    name: string;
    pointsUsed: number;
    victories: Victory[];
    tempPoints?: number; // punti usati nella sessione corrente
};

export type PlayersMap = Record<string, Player>;

type GameContextType = {
    players: PlayersMap;
    sessionActive: boolean;
    sessionTimerExpiresAt: number;
    currentQuestion: string;
    lastVoterId: string | null;
    maxPoints: number;
    addPlayer: (name: string) => Promise<void>;
    deletePlayer: (playerId: string) => Promise<void>;
    startSession: (question?: string) => Promise<void>;
    stopSession: () => Promise<void>;
    handleBuzzerClick: (playerId: string) => Promise<void>;
    resetPlayerPoints: (playerId: string) => Promise<void>;
    selectPlayerLocal: (playerId: string | null) => void;
    getSelectedPlayerId: () => string | null;
    setMaxPoints: (points: number) => Promise<void>;
    registerVictory: (winnerId: string, targetName: string, pointsUsed: number) => Promise<void>;
    deleteVictory: (playerId: string, index: number) => Promise<void>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = (): GameContextType => {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error("useGame deve essere usato all'interno di GameProvider");
    return ctx;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [players, setPlayers] = useState<PlayersMap>({});
    const [sessionActive, setSessionActive] = useState(false);
    const [sessionTimerExpiresAt, setSessionTimerExpiresAt] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState("Chi merita un punto?");
    const [lastVoterId, setLastVoterId] = useState<string | null>(null);
    const [maxPoints, setMaxPointsState] = useState(10);

    const expiryWatcherRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /** Parsing snapshot Firebase */
    const parsePlayersSnapshot = (snap: DataSnapshot): PlayersMap => {
        const val = snap.val();
        if (!val || typeof val !== "object") return {};
        const out: PlayersMap = {};
        for (const key of Object.keys(val)) {
            const item = val[key];
            if (item && typeof item.name === "string") {
                const victories = Array.isArray(item.victories) ? item.victories : [];
                const pointsUsed = victories.reduce((sum: number, v: Victory) => sum + (v.pointsUsed ?? 0), 0);
                out[key] = {
                    name: item.name,
                    pointsUsed,
                    victories,
                    tempPoints: 0
                };
            }
        }
        return out;
    };

    /** Listener players */
    useEffect(() => {
        const r = ref(db, "game/players");
        const unsub = onValue(r, snap => {
            setPlayers(parsePlayersSnapshot(snap));
        });
        return () => unsub();
    }, [maxPoints]);

    /** Listener game meta */
    useEffect(() => {
        const r = ref(db, "game");
        const unsub = onValue(r, snap => {
            const val = snap.val() || {};
            setSessionActive(Boolean(val.sessionActive));
            setSessionTimerExpiresAt(Number(val.sessionTimerExpiresAt ?? 0));
            setCurrentQuestion(typeof val.currentQuestion === "string" ? val.currentQuestion : "Chi merita un punto?");
            setLastVoterId(val.lastVoterId ?? null);
            setMaxPointsState(Number(val.maxPoints ?? 10));
        });
        return () => unsub();
    }, []);

    /** Timer globale */
    useEffect(() => {
        if (expiryWatcherRef.current) clearTimeout(expiryWatcherRef.current);
        if (!sessionActive || !sessionTimerExpiresAt) return;

        const delta = sessionTimerExpiresAt - Date.now();
        if (delta <= 0) {
            update(ref(db, "game"), { sessionActive: false });
            return;
        }

        expiryWatcherRef.current = setTimeout(() => {
            update(ref(db, "game"), { sessionActive: false });
        }, delta);

        return () => { if (expiryWatcherRef.current) clearTimeout(expiryWatcherRef.current); };
    }, [sessionActive, sessionTimerExpiresAt]);

    /** Funzioni CRUD giocatore */
    const addPlayer = async (name: string) => {
        const newRef = ref(db, `game/players/${name}`);
        await update(newRef, { name, victories: [] });
    };

    const deletePlayer = async (playerId: string) => {
        const playerRef = ref(db, `game/players/${playerId}`);
        await remove(playerRef);
    };

    /** Start/Stop sessione */
    const startSession = async (question?: string) => {
        const now = Date.now();
        const expiresAt = now + 3000; // default 3s
        await update(ref(db, "game"), {
            sessionActive: true,
            sessionTimerExpiresAt: expiresAt,
            currentQuestion: question ?? "Chi merita un punto?",
            lastVoterId: null
        });

        // reset punti temporanei
        setPlayers(prev => {
            const copy: PlayersMap = {};
            for (const [id, p] of Object.entries(prev)) {
                copy[id] = { ...p, tempPoints: 0 };
            }
            return copy;
        });
    };

    const stopSession = async () => {
        await update(ref(db, "game"), { sessionActive: false, sessionTimerExpiresAt: 0 });
    };

    /** Max points globale */
    const setMaxPoints = async (points: number) => {
        setMaxPointsState(points);
        await update(ref(db, "game"), { maxPoints: points });
    };

    /** Reset punti giocatore */
    const resetPlayerPoints = async (playerId: string) => {
        const playerRef = ref(db, `game/players/${playerId}`);
        await update(playerRef, { victories: [] });
    };

    /** Handle buzzer click */
    const handleBuzzerClick = async (playerId: string) => {
        setPlayers(prev => {
            const p = prev[playerId];
            if (!p) return prev;
            const tempPoints = (p.tempPoints ?? 0) + 1;
            return { ...prev, [playerId]: { ...p, tempPoints } };
        });
        const playerRef = ref(db, `game/players/${playerId}`);
        const now = Date.now();
        const newExpiry = now + 3000;
        await update(ref(db, "game"), { sessionTimerExpiresAt: newExpiry, lastVoterId: playerId });
    };

    /** Registra vittoria */
    const registerVictory = async (winnerId: string, targetName: string, pointsUsed: number) => {
        const playerRef = ref(db, `game/players/${winnerId}/victories`);
        await runTransaction(playerRef, (current) => {
            const victories = Array.isArray(current) ? current : [];
            victories.push({ targetName, pointsUsed });
            return victories;
        });
    };

    /** Elimina singola vittoria */
    const deleteVictory = async (playerId: string, index: number) => {
        const playerRef = ref(db, `game/players/${playerId}/victories`);
        const snap = await get(playerRef);
        const victories = Array.isArray(snap.val()) ? snap.val() : [];
        if (victories[index]) {
            victories.splice(index, 1);
            await update(playerRef, victories);
        }
    };

    /** Local storage giocatore */
    const selectPlayerLocal = (playerId: string | null) => {
        if (typeof window !== "undefined") {
            if (playerId) localStorage.setItem("selectedPlayerId", playerId);
            else localStorage.removeItem("selectedPlayerId");
        }
    };
    const getSelectedPlayerId = (): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("selectedPlayerId");
    };

    return (
        <GameContext.Provider
            value={{
                players,
                sessionActive,
                sessionTimerExpiresAt,
                currentQuestion,
                lastVoterId,
                maxPoints,
                addPlayer,
                deletePlayer,
                startSession,
                stopSession,
                handleBuzzerClick,
                resetPlayerPoints,
                selectPlayerLocal,
                getSelectedPlayerId,
                setMaxPoints,
                registerVictory,
                deleteVictory
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
