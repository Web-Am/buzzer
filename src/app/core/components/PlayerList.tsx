// src/components/PlayerList.tsx
import React from "react";
import { PlayersMap } from "../context/GameContext";

type Props = {
    players: PlayersMap;
    onSelect?: (id: string) => void;
    selectedId?: string | null;
};

export const PlayerList: React.FC<Props> = ({ players, onSelect, selectedId }) => {
    const entries = Object.entries(players || {});
    if (entries.length === 0) {
        return <div className="text-sm text-gray-500">Nessun giocatore ancora.</div>;
    }
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {entries.map(([id, p]) => (
                <div
                    key={id}
                    onClick={() => onSelect && onSelect(id)}
                    className={`flex items-center justify-between p-3 rounded-lg shadow-md cursor-pointer transition-transform
            ${selectedId === id ? "ring-2 ring-indigo-400" : "hover:scale-[1.01]"}`}
                >
                    <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-gray-500">ID: {id}</div>
                    </div>
                    <div className="text-xl font-bold">{p.pointsUsed}</div>
                </div>
            ))}
        </div>
    );
};

export default PlayerList;
