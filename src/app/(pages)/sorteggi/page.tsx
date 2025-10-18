'use client';

import React from "react";
import { useGame } from "@/app/core/context/GameContext";

export default function SorteggiPage() {
    const { players } = useGame();

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold mb-4">Storico Vittorie</h1>

            {Object.keys(players).length === 0 ? (
                <div>Nessun giocatore registrato.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 rounded">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border">Giocatore</th>
                                <th className="px-4 py-2 border">Numero Vittorie</th>
                                <th className="px-4 py-2 border">Dettaglio Vittorie</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(players).map(([id, p]) => (
                                <tr key={id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border font-semibold">{p.name}</td>
                                    <td className="px-4 py-2 border text-center">{p.victories.length}</td>
                                    <td className="px-4 py-2 border">
                                        {p.victories.length === 0 ? (
                                            <span className="text-gray-500">Nessuna vittoria</span>
                                        ) : (
                                            <ul className="list-disc list-inside text-sm">
                                                {p.victories.map((v, i) => (
                                                    <li key={i}>
                                                        {v.targetName} - {v.pointsUsed} punti
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
