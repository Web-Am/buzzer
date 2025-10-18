'use client';

import React, { useState, useEffect } from "react";
import { useGame, Victory } from "@/app/core/context/GameContext";

export default function MasterPage() {
    const {
        players,
        startSession,
        stopSession,
        sessionActive,
        currentQuestion,
        maxPoints,
        sessionDuration,
        setMaxPoints,
        deletePlayer,
        deleteVictory
    } = useGame();

    const [questionInput, setQuestionInput] = useState(currentQuestion);
    const [maxPointsInput, setMaxPointsInput] = useState(maxPoints);
    const [durationInput, setDurationInput] = useState(sessionDuration / 1000); // in secondi

    // Sincronizza questionInput se cambia currentQuestion
    useEffect(() => {
        setQuestionInput(currentQuestion);
    }, [currentQuestion]);

    const handleStart = async () => {
        if (!questionInput.trim()) return;
        await startSession(questionInput, durationInput);
    };

    const handleStop = async () => {
        await stopSession();
    };

    const handleMaxPointsChange = async () => {
        const val = Number(maxPointsInput);
        if (isNaN(val) || val < 1) return;
        await setMaxPoints(val);
    };

    const handleDeletePlayer = (playerId: string) => {
        if (confirm("Sei sicuro di voler eliminare questo giocatore?")) {
            deletePlayer(playerId);
        }
    };

    const handleDeleteVictory = (playerId: string, index: number) => {
        if (confirm("Sei sicuro di voler eliminare questa vittoria?")) {
            deleteVictory(playerId, index);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold mb-4">Master Buzzer</h1>

            {/* Imposta giocatore da votare e durata */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                    type="text"
                    placeholder="Giocatore da votare"
                    value={questionInput}
                    onChange={e => setQuestionInput(e.target.value)}
                    className="flex-1 p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                    type="number"
                    placeholder="Durata (s)"
                    value={durationInput}
                    onChange={e => setDurationInput(Number(e.target.value))}
                    className="w-24 p-2 border rounded"
                />
                <button
                    onClick={handleStart}
                    disabled={sessionActive}
                    className={`px-6 py-2 rounded font-bold text-white ${sessionActive ? "bg-gray-400" : "bg-indigo-600"} hover:bg-indigo-700 transition`}
                >
                    Avvia Sessione
                </button>
                <button
                    onClick={handleStop}
                    className="px-6 py-2 rounded font-bold text-white bg-red-600 hover:bg-red-700 transition"
                >
                    Ferma Sessione
                </button>
            </div>

            {/* Imposta max punti */}
            <div className="card p-4 border rounded shadow-sm flex items-center gap-4 w-full md:w-64">
                <label className="font-semibold">Max punti:</label>
                <input
                    type="number"
                    value={maxPointsInput}
                    onChange={e => setMaxPointsInput(Number(e.target.value))}
                    className="border p-1 rounded w-20"
                />
                <button
                    onClick={handleMaxPointsChange}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                    Imposta
                </button>
            </div>

            {/* Lista giocatori */}
            <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(players).map(([id, p]) => {
                    const available = maxPoints - p.pointsUsed;
                    return (
                        <div key={id} className="p-4 border rounded shadow flex flex-col justify-between">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-bold">{p.name}</div>
                                    <div>Usati: {p.pointsUsed} / Disponibili: {available}</div>
                                </div>
                                <button
                                    onClick={() => handleDeletePlayer(id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Elimina
                                </button>
                            </div>

                            {/* Storico vittorie */}
                            {p.victories.length > 0 && (
                                <details className="mt-2 text-sm text-gray-700">
                                    <summary>Storico vittorie ({p.victories.length})</summary>
                                    <ul className="list-disc list-inside mt-1">
                                        {p.victories.map((v: Victory, i) => (
                                            <li key={i} className="flex justify-between items-center">
                                                <span>{v.targetName} - {v.pointsUsed} punti</span>
                                                <button
                                                    onClick={() => handleDeleteVictory(id, i)}
                                                    className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600 text-xs"
                                                >
                                                    X
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Aggiungi nuovo giocatore */}
            <AddPlayerForm />
        </div>
    );
}

/** Componente aggiungi giocatore */
const AddPlayerForm: React.FC = () => {
    const { addPlayer } = useGame();
    const [name, setName] = useState("");

    const handleAdd = async () => {
        if (!name.trim()) return;
        await addPlayer(name.trim());
        setName("");
    };

    return (
        <div className="flex gap-2 mt-4">
            <input
                type="text"
                placeholder="Nuovo giocatore"
                value={name}
                onChange={e => setName(e.target.value)}
                className="p-2 border rounded flex-1"
            />
            <button
                onClick={handleAdd}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Aggiungi
            </button>
        </div>
    );
};
