'use client';

import React, { useEffect, useState, useRef } from "react";
import { useGame, Player } from "@/app/core/context/GameContext";

export default function SlavePage() {
    const {
        players,
        sessionActive,
        sessionTimerExpiresAt,
        currentQuestion,
        handleBuzzerClick,
        selectPlayerLocal,
        getSelectedPlayerId,
        maxPoints
    } = useGame();

    const [isClient, setIsClient] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [timer, setTimer] = useState(0);
    const [popup, setPopup] = useState<string | null>(null);
    const [popupColor, setPopupColor] = useState<string>("bg-gray-400");
    const [showVictories, setShowVictories] = useState(false);
    const [sessionClicks, setSessionClicks] = useState(0);

    const prevSessionActive = useRef<boolean>(false);
    const popupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Solo client
    useEffect(() => setIsClient(true), []);

    // Recupero giocatore selezionato da localStorage
    useEffect(() => {
        if (!isClient) return;
        const stored = getSelectedPlayerId?.();
        if (stored) setSelectedPlayer(stored);
    }, [isClient, getSelectedPlayerId]);

    // Salva selezione locale
    useEffect(() => {
        if (!isClient) return;
        selectPlayerLocal(selectedPlayer);
    }, [selectedPlayer, isClient, selectPlayerLocal]);

    // Reset click sessione all'inizio di una nuova sessione
    useEffect(() => {
        if (!isClient) return;
        if (sessionActive) setSessionClicks(0);
    }, [sessionActive, isClient]);

    // Timer countdown
    useEffect(() => {
        if (!isClient) return;
        let interval: ReturnType<typeof setInterval>;
        if (sessionActive && sessionTimerExpiresAt) {
            interval = setInterval(() => {
                setTimer(Math.max(sessionTimerExpiresAt - Date.now(), 0));
            }, 100);
        } else setTimer(0);
        return () => interval && clearInterval(interval);
    }, [sessionActive, sessionTimerExpiresAt, isClient]);

    // Determina popup fine sessione
    useEffect(() => {
        if (!isClient) return;

        // Condizione: la sessione è appena terminata
        if (prevSessionActive.current && !sessionActive && selectedPlayer) {
            const myPoints = players[selectedPlayer]?.tempPoints ?? 0;
            const allTempPoints = Object.values(players).map(p => p.tempPoints ?? 0);
            const maxPointsSession = Math.max(...allTempPoints);
            const winnersCount = allTempPoints.filter(p => p === maxPointsSession).length;

            if (myPoints === maxPointsSession && winnersCount === 1) {
                setPopup("HAI VINTO!");
                setPopupColor("bg-green-500");
            } else if (myPoints === maxPointsSession && winnersCount > 1) {
                setPopup("PAREGGIO!");
                setPopupColor("bg-gray-400");
            } else {
                setPopup("HAI PERSO!");
                setPopupColor("bg-red-500");
            }

            // Popup scompare dopo 4 secondi
            popupTimeoutRef.current = setTimeout(() => setPopup(null), 4000);
        }

        prevSessionActive.current = sessionActive;

        return () => {
            if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
        };
    }, [sessionActive, selectedPlayer, players, isClient]);

    const handleSelectPlayer = (id: string | null) => {
        if (selectedPlayer && !confirm("Cambiare giocatore? I punti attuali saranno salvati")) return;
        setSelectedPlayer(id);
    };

    const handleBuzzer = async () => {
        if (!selectedPlayer) return;
        await handleBuzzerClick(selectedPlayer);
        setSessionClicks(c => c + 1);
    };

    const sessionTop = (): { playerNames: string[]; points: number } | null => {
        if (!sessionActive) return null;
        let maxTempPoints = -1;
        const leaders: string[] = [];
        for (const [, p] of Object.entries(players)) {
            if ((p.tempPoints ?? 0) > maxTempPoints) {
                maxTempPoints = p.tempPoints ?? 0;
                leaders.length = 0;
                leaders.push(p.name);
            } else if ((p.tempPoints ?? 0) === maxTempPoints) {
                leaders.push(p.name);
            }
        }
        return maxTempPoints > 0 ? { playerNames: leaders, points: maxTempPoints } : null;
    };

    if (!isClient) return null;

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
    const pointsUsed = playerObj.pointsUsed;
    const pointsAvailable = maxPoints - pointsUsed;
    const top = sessionTop();

    return (
        <div className="p-6 flex flex-col items-center min-h-screen space-y-6 bg-gray-50">
            {/* Pulsante cambia giocatore */}
            <div className="w-full max-w-md flex justify-end">
                <button
                    onClick={() => handleSelectPlayer(null)}
                    className="px-3 py-1 rounded bg-indigo-200 hover:bg-indigo-300 text-sm font-medium"
                >
                    Cambia giocatore
                </button>
            </div>

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
                <div>Punti usati: {pointsUsed}</div>
                <div>Punti disponibili: {pointsAvailable}</div>
                <div>Punti temporanei in questa sessione: {tempPoints}</div>

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

            {/* Leader sessione */}
            {sessionActive && top && (
                <div className="w-full max-w-md p-2 bg-indigo-100 rounded text-indigo-900 font-semibold text-center">
                    In testa: {top.playerNames.join(", ")} con {top.points} punti
                </div>
            )}

            {/* Buzzer e timer */}
            {sessionActive && pointsAvailable > 0 && (
                <div className="flex flex-col items-center space-y-3">
                    <button
                        onClick={handleBuzzer}
                        className="w-40 h-40 rounded-full bg-red-400 text-white text-2xl font-bold shadow-lg active:scale-95 transition-transform"
                    >
                        BUZZER
                    </button>
                    <div>Hai cliccato il buzzer: {sessionClicks} volte</div>
                    <div>Tempo rimanente: {(timer / 1000).toFixed(2)}s</div>
                </div>
            )}

            {/* Popup vittoria/sconfitta */}
            {popup && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className={`p-6 rounded-xl text-2xl font-bold shadow-lg text-white ${popupColor} flex flex-col items-center space-y-4`}>
                        <div>{popup}</div>
                        <button
                            onClick={() => setPopup(null)}
                            className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition"
                        >
                            Chiudi
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
