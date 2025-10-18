'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
    ref,
    onValue,
    update,
    runTransaction,
    DataSnapshot,
    remove
} from "firebase/database";
import { db } from "../lib/firebase";

/** Tipi */
export type Victory = { targetName: string; pointsUsed: number };

export type Player = {
    name: string;
    pointsUsed: number;       // somma punti vittorie
    pointsAvailable: number;  // maxPoints - pointsUsed
    tempPoints: number;       // punti accumulati nella sessione corrente
    victories: Victory[];
};

export type PlayersMap = Record<string, Player>;

type GameContextType = {
    players: PlayersMap;
    sessionActive: boolean;
    sessionTimerExpiresAt: number;
    currentQuestion: string;
    lastVoterId: string | null;
    maxPoints: number;
    sessionDuration: number;
    addPlayer: (name: string) => Promise<void>;
    deletePlayer: (playerId: string) => Promise<void>;
    deleteVictory: (playerId: string, index: number) => Promise<void>;
    startSession: (question?: string, durationSec?: number) => Promise<void>;
    stopSession: () => Promise<void>;
    handleBuzzerClick: (playerId: string) => Promise<void>;
    resetPlayerPoints: (playerId: string) => Promise<void>;
    selectPlayerLocal: (playerId: string | null) => void;
    getSelectedPlayerId: () => string | null;
    setMaxPoints: (points: number) => Promise<void>;
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
    const [sessionDuration, setSessionDuration] = useState(3000);

    const expiryWatcherRef = useRef<number | null>(null);

    /** Parsing snapshot Firebase */
    const parsePlayersSnapshot = (snap: DataSnapshot): PlayersMap => {
        const val = snap.val();
        if (!val || typeof val !== "object") return {};
        const out: PlayersMap = {};
        for (const key of Object.keys(val)) {
            const item = val[key];
            if (item && typeof item.name === "string") {
                const pointsUsed = Array.isArray(item.victories)
                    ? item.victories.reduce((sum: number, v: Victory) => sum + (v.pointsUsed ?? 0), 0)
                    : 0;

                const tempPoints = Number(item.tempPoints ?? 0);

                out[key] = {
                    name: item.name,
                    pointsUsed,
                    tempPoints,
                    pointsAvailable: maxPoints - pointsUsed,
                    victories: Array.isArray(item.victories) ? item.victories : []
                };
            }
        }
        return out;
    };

    /** Listener players */
    useEffect(() => {
        const r = ref(db, "game/players");
        const unsub = onValue(r, (snap) => {
            setPlayers(parsePlayersSnapshot(snap));
        });
        return () => unsub();
    }, [maxPoints]);

    /** Listener game meta */
    useEffect(() => {
        const r = ref(db, "game");
        const unsub = onValue(r, (snap) => {
            const val = snap.val() || {};
            setSessionActive(Boolean(val.sessionActive));
            setSessionTimerExpiresAt(Number(val.sessionTimerExpiresAt ?? 0));
            setCurrentQuestion(typeof val.currentQuestion === "string" ? val.currentQuestion : "Chi merita un punto?");
            setLastVoterId(val.lastVoterId ?? null);
            setMaxPointsState(Number(val.maxPoints ?? 10));
            setSessionDuration(Number(val.sessionDuration ?? 3000));
        });
        return () => unsub();
    }, []);

    /** Timer globale */
    useEffect(() => {
        if (expiryWatcherRef.current) clearTimeout(expiryWatcherRef.current);
        if (!sessionActive || !sessionTimerExpiresAt) return;

        const delta = sessionTimerExpiresAt - Date.now();
        if (delta <= 0) {
            endSession();
            return;
        }

        expiryWatcherRef.current = window.setTimeout(() => {
            endSession();
        }, delta);

        return () => { if (expiryWatcherRef.current) clearTimeout(expiryWatcherRef.current); };
    }, [sessionActive, sessionTimerExpiresAt]);

    /** Aggiungi giocatore */
    const addPlayer = async (name: string) => {
        const newRef = ref(db, `game/players/${name}`);
        await update(newRef, { name, victories: [], tempPoints: 0 });
    };

    const deletePlayer = async (playerId: string) => {
        const playerRef = ref(db, `game/players/${playerId}`);
        await remove(playerRef);
    };

    const deleteVictory = async (playerId: string, index: number) => {
        const playerRef = ref(db, `game/players/${playerId}/victories`);
        await runTransaction(playerRef, (current) => {
            const victories = Array.isArray(current) ? current : [];
            victories.splice(index, 1);
            return victories;
        });
    };

    /** Start session */
    const startSession = async (question?: string, durationSec?: number) => {
        const now = Date.now();
        const expiresAt = now + (durationSec ? durationSec * 1000 : 3000);

        // Reset tempPoints dei giocatori
        for (const id of Object.keys(players)) {
            const playerRef = ref(db, `game/players/${id}`);
            await update(playerRef, { tempPoints: 0 });
        }

        await update(ref(db, "game"), {
            sessionActive: true,
            sessionTimerExpiresAt: expiresAt,
            currentQuestion: question ?? "Chi merita un punto?",
            lastVoterId: null,
            sessionDuration: durationSec ? durationSec * 1000 : 3000
        });
    };

    /** Stop session */
    const stopSession = async () => {
        await endSession();
    };

    /** Fine sessione: calcola vincitore e registra vittorie */
    const endSession = async () => {
        if (!sessionActive) return;

        // Trova punteggio più alto nella sessione
        const maxTemp = Math.max(...Object.values(players).map(p => p.tempPoints));
        const winners = Object.entries(players).filter(([_, p]) => p.tempPoints === maxTemp && maxTemp > 0);

        // Registra la vittoria solo al vincitore
        for (const [id, p] of winners) {
            const playerRef = ref(db, `game/players/${id}/victories`);
            await runTransaction(playerRef, (current) => {
                const victories = Array.isArray(current) ? current : [];
                // Evita doppio inserimento
                if (victories.length > 0) {
                    const last = victories[victories.length - 1];
                    if (last.targetName === currentQuestion && last.pointsUsed === p.tempPoints) return victories;
                }
                victories.push({ targetName: currentQuestion, pointsUsed: p.tempPoints });
                return victories;
            });
        }

        await update(ref(db, "game"), {
            sessionActive: false,
            sessionTimerExpiresAt: 0
        });
    };

    /** Set max punti globale */
    const setMaxPoints = async (points: number) => {
        setMaxPointsState(points);
        await update(ref(db, "game"), { maxPoints: points });
    };

    /** Reset punti giocatore */
    const resetPlayerPoints = async (playerId: string) => {
        const playerRef = ref(db, `game/players/${playerId}/victories`);
        await update(playerRef, []); // elimina tutte le vittorie → pointsUsed = 0
    };

    /** Handle buzzer click */
    const handleBuzzerClick = async (playerId: string) => {
        const playerRef = ref(db, `game/players/${playerId}/tempPoints`);

        await runTransaction(playerRef, (current) => {
            const value = Number(current ?? 0);
            if (value >= maxPoints) return value;
            return value + 1;
        });

        // Aggiorna ultimo voter e timer sessione
        if (sessionActive) {
            const newExpiry = Date.now() + sessionDuration;
            await update(ref(db, "game"), { sessionTimerExpiresAt: newExpiry, lastVoterId: playerId });
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
                sessionDuration,
                addPlayer,
                deletePlayer,
                deleteVictory,
                startSession,
                stopSession,
                handleBuzzerClick,
                resetPlayerPoints,
                selectPlayerLocal,
                getSelectedPlayerId,
                setMaxPoints
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
