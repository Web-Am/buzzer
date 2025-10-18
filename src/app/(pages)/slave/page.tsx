'use client';

import React, { useEffect, useState } from "react";
import { useGame, Player } from "@/app/core/context/GameContext";

export default function SlavePage() {
    const {
        players,
        sessionActive,
        sessionTimerExpiresAt,
        currentQuestion,
        handleBuzzerClick,
        lastVoterId,
        selectPlayerLocal,
        getSelectedPlayerId,
        maxPoints
    } = useGame();

    const [isClient, setIsClient] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [timer, setTimer] = useState(0);
    const [popup, setPopup] = useState<string | null>(null);
    const [showVictories, setShowVictories] = useState(false);
    const [sessionClicks, setSessionClicks] = useState(0);
    const [prevSessionActive, setPrevSessionActive] = useState(false);

    // Client only
    useEffect(() => setIsClient(true), []);

    useEffect(() => {
        if (!isClient) return;
        const stored = getSelectedPlayerId?.();
        if (stored) setSelectedPlayer(stored);
    }, [isClient, getSelectedPlayerId]);

    useEffect(() => {
        if (!isClient) return;
        if (sessionActive) setSessionClicks(0);
    }, [sessionActive, isClient]);

    // Timer
    useEffect(() => {
        if (!isClient) return;
        let interval: ReturnType<typeof setInterval>;
        if (sessionActive && sessionTimerExpiresAt) {
            interval = setInterval(() => {
                setTimer(Math.max(sessionTimerExpiresAt - Date.now(), 0));
            }, 50);
        } else setTimer(0);
        return () => interval && clearInterval(interval);
    }, [sessionActive, sessionTimerExpiresAt, isClient]);

    // Popup fine sessione
    useEffect(() => {
        if (!isClient) return;
        if (prevSessionActive && !sessionActive) {
            if (selectedPlayer && lastVoterId) {
                if (selectedPlayer === lastVoterId) setPopup("HAI VINTO!");
                else setPopup("HAI PERSO!");
                const t = setTimeout(() => setPopup(null), 3000);
                return () => clearTimeout(t);
            }
        }
        setPrevSessionActive(sessionActive);
    }, [sessionActive, selectedPlayer, lastVoterId, prevSessionActive, isClient]);

    const handleSelectPlayer = (id: string | null) => {
        if (selectedPlayer && !confirm("Cambiare giocatore? I punti attuali saranno salvati")) return;
        setSelectedPlayer(id);
        if (id) selectPlayerLocal(id);
    };

    const sessionTop = (): { playerName: string; points: number } | null => {
        if (!sessionActive) return null;
        let maxPointsTemp = 0;
        let winnerName = "";
        for (const [, p] of Object.entries(players)) {
            const temp = p.tempPoints ?? 0;
            if (temp > maxPointsTemp) {
                maxPointsTemp = temp;
                winnerName = p.name;
            }
        }
        return maxPointsTemp > 0 ? { playerName: winnerName, points: maxPointsTemp } : null;
    };

    if (!isClient) return null;

    // Controllo player valido
    if (!selectedPlayer || !players[selectedPlayer]) {
        return (
            <div className="p-6 flex flex-col items-center min-h-screen space-y-4">
                <h2 className="text-2xl font-bold">Seleziona il tuo giocatore</h2>
                <div className="flex flex-wrap gap-3 justify-center">
                    {Object.entries(players).map(([id, p]) => (
                        <button
                            key={id}
                            onClick={() => handleSelectPlayer(id)}
                            className="px-6 py-3 bg-indigo-200 text-gray-900 rounded-lg shadow-sm hover:bg-indigo-300 transition"
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const playerObj: Player = players[selectedPlayer];
    const tempPoints = playerObj?.tempPoints ?? 0;
    const pointsUsed = playerObj.pointsUsed + tempPoints;
    const pointsAvailable = maxPoints - pointsUsed;
    const top = sessionTop();

    return (
        <div className="p-6 flex flex-col items-center min-h-screen space-y-6 bg-gray-50">
            {/* Giocatore da votare */}
            {sessionActive && (
                <div className="w-full max-w-md p-6 bg-yellow-100 rounded-xl shadow-md text-center">
                    <div className="text-gray-700 font-semibold">Giocatore da votare</div>
                    <div className="text-3xl font-bold text-gray-900">{currentQuestion}</div>
                </div>
            )}

            {/* Card punti personali */}
            <div className="w-full max-w-md p-4 bg-white rounded-xl shadow-sm space-y-2">
                <div className="font-bold text-gray-800 text-lg">{playerObj.name}</div>
                <div>Punti usati in questa sessione: {tempPoints}</div>
                <div>Punti totali usati: {pointsUsed}</div>
                <div>Punti disponibili: {pointsAvailable}</div>
                <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setShowVictories(!showVictories)}
                >
                    {showVictories ? "Nascondi vittorie" : "Mostra vittorie"}
                </button>
                {showVictories && (
                    <ul className="mt-2 space-y-1">
                        {playerObj.victories.map((v, i) => (
                            <li key={i} className="text-gray-700 text-sm">
                                {v.targetName} ({v.pointsUsed})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Buzzer e timer */}
            {sessionActive && pointsAvailable > 0 && (
                <div className="flex flex-col items-center space-y-3">
                    <button
                        onClick={() => {
                            handleBuzzerClick(selectedPlayer);
                            setSessionClicks(c => c + 1);
                        }}
                        className="w-40 h-40 rounded-full bg-red-400 text-white text-2xl font-bold shadow-lg active:scale-95 transition-transform"
                    >
                        BUZZER
                    </button>
                    <div>Hai cliccato il buzzer: {sessionClicks} volte</div>
                    <div>Tempo rimanente: {(timer / 1000).toFixed(2)}s</div>
                    {top && (
                        <div className="mt-2 text-gray-800 font-semibold">
                            In sessione: {top.playerName} con {top.points} punti
                        </div>
                    )}
                </div>
            )}

            {/* Popup */}
            {popup && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl text-2xl font-bold shadow-lg text-gray-900">{popup}</div>
                </div>
            )}
        </div>
    );
}
