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

    // Solo client
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Recupero giocatore selezionato dal localStorage
    useEffect(() => {
        if (!isClient) return;
        const stored = getSelectedPlayerId?.();
        if (stored) setSelectedPlayer(stored);
    }, [isClient, getSelectedPlayerId]);

    // Reset contatore ad inizio sessione
    useEffect(() => {
        if (!isClient) return;
        if (sessionActive) setSessionClicks(0);
    }, [sessionActive, isClient]);

    // Timer countdown sicuro
    useEffect(() => {
        if (!isClient) return;
        let interval: any;
        if (sessionActive && sessionTimerExpiresAt) {
            interval = setInterval(() => {
                setTimer(Math.max(sessionTimerExpiresAt - Date.now(), 0));
            }, 50);
        } else setTimer(0);
        return () => interval && clearInterval(interval);
    }, [sessionActive, sessionTimerExpiresAt, isClient]);

    // Popup vittoria/sconfitta solo fine sessione corrente
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

    // Selezione giocatore
    const handleSelectPlayer = (id: string | null) => {
        if (selectedPlayer && !confirm("Cambiare giocatore? I punti attuali saranno salvati")) return;
        setSelectedPlayer(id);
        if (id) selectPlayerLocal(id);
    };

    // Leader sessione
    const sessionTop = (): { playerName: string; points: number } | null => {
        if (!sessionActive) return null;
        let maxPointsTemp = 0;
        let winnerName = "";
        for (const [_, p] of Object.entries(players)) {
            const temp = p.tempPoints ?? 0;
            if (temp > maxPointsTemp) {
                maxPointsTemp = temp;
                winnerName = p.name;
            }
        }
        return maxPointsTemp > 0 ? { playerName: winnerName, points: maxPointsTemp } : null;
    };

    if (!isClient) return null; // SSR-safe

    const playerObj: Player | null = selectedPlayer ? players[selectedPlayer] : null;
    const tempPoints = playerObj?.tempPoints ?? 0;
    const pointsUsed = playerObj ? playerObj.pointsUsed + tempPoints : 0;
    const pointsAvailable = playerObj ? maxPoints - pointsUsed : 0;
    const top = sessionTop();

    if (!selectedPlayer) {
        return (
            <div className="p-6 flex flex-col items-center min-h-screen space-y-4">
                <h2 className="text-2xl font-bold">Seleziona il tuo giocatore</h2>
                <div className="flex flex-wrap gap-3 justify-center">
                    {Object.entries(players).map(([id, p]) => (
                        <button
                            key={id}
                            onClick={() => handleSelectPlayer(id)}
                            className="px-6 py-3 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition"
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col items-center min-h-screen space-y-6">
            {/* Giocatore da votare */}
            {sessionActive && (
                <div className="w-full max-w-lg p-6 bg-indigo-100 rounded-xl shadow text-center space-y-2">
                    <div className="text-gray-600 font-semibold">Giocatore da votare</div>
                    <div className="text-2xl font-bold text-indigo-700">{currentQuestion}</div>
                </div>
            )}

            {/* Card punti personali e vittorie */}
            <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow space-y-4">
                <div className="text-xl font-bold">{playerObj?.name}</div>
                <div className="flex justify-between">
                    <div>Punti Usati:</div>
                    <div className="font-bold">{pointsUsed} / {maxPoints}</div>
                </div>
                <div className="flex justify-between">
                    <div>Punti Disponibili:</div>
                    <div className="font-bold">{pointsAvailable}</div>
                </div>

                <button
                    className="w-full px-4 py-2 bg-yellow-400 text-white rounded-lg shadow hover:bg-yellow-500 transition"
                    onClick={() => setShowVictories(!showVictories)}
                >
                    {showVictories ? "Nascondi Vittorie" : "Mostra Vittorie"}
                </button>

                {showVictories && (
                    <div className="mt-2 max-h-40 overflow-y-auto border p-2 rounded">
                        {playerObj?.victories.length ? (
                            playerObj.victories.map((v, i) => (
                                <div key={i} className="flex justify-between py-1 border-b last:border-b-0">
                                    <div>{v.targetName}</div>
                                    <div>{v.pointsUsed} pts</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500 text-center">Nessuna vittoria</div>
                        )}
                    </div>
                )}
            </div>

            {/* Timer e buzzer */}
            {sessionActive && (
                <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow flex flex-col items-center space-y-4">
                    <div className="text-center space-y-1">
                        <div className="text-gray-600 font-semibold">Tempo rimanente</div>
                        <div className="text-3xl font-bold">{(timer / 1000).toFixed(2)}s</div>
                    </div>
                    <div className="flex justify-between">
                        <div>Buzzer cliccati:</div>
                        <div className="font-bold">{sessionClicks}</div>
                    </div>

                    {top && (
                        <div className="p-2 bg-yellow-100 rounded w-full text-center font-bold">
                            Leader: {top.playerName} - {top.points} pts
                        </div>
                    )}

                    {pointsAvailable > 0 && (
                        <button
                            onClick={() => {
                                handleBuzzerClick(selectedPlayer!);
                                setSessionClicks(prev => prev + 1);
                            }}
                            className="w-40 h-40 rounded-full bg-red-600 text-white text-2xl font-bold shadow-lg active:scale-95 transition-transform"
                        >
                            BUZZER
                        </button>
                    )}
                </div>
            )}

            {/* Cambia giocatore */}
            <button
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 transition"
                onClick={() => handleSelectPlayer(null)}
            >
                Cambia Giocatore
            </button>

            {/* Popup */}
            {popup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded p-6 text-2xl font-bold shadow-lg">{popup}</div>
                </div>
            )}
        </div>
    );
}
