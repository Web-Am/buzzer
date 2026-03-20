'use client';

import { useState } from 'react';
import { Room, Participant } from "@/app/types";
import { Modal } from '../ui/Modal';

interface Props {
    room: Room;
}

export function ParticipantsTable({ room }: Props) {
    const [selectedParticipant, setSelectedParticipant] = useState<{ key: string; data: Participant } | null>(null);
    const participants = Object.entries(room.participants ?? {});

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Partecipanti</h3>
            <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left">Nome</th>
                            <th className="px-3 py-2 text-right">Round vinti</th>
                            <th className="px-3 py-2 text-right">Punti usati</th>
                            <th className="px-3 py-2 text-right">Punti disponibili</th>
                            <th className="px-3 py-2 text-right">Connesso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map(([key, p]) => {
                            const used = p.pointsUsed ?? 0;
                            const avail = p.pointsTotal - used;
                            const isOnline = p.isOnline;
                            return (
                                <tr key={key} className="border-t cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => setSelectedParticipant({ key, data: p })}>
                                    <td className="px-3 py-2">{p.name}</td>
                                    <td className="px-3 py-2 text-right">
                                        {p.roundsWon?.length ?? 0}
                                    </td>
                                    <td className="px-3 py-2 text-right">{used}</td>
                                    <td className="px-3 py-2 text-right">{avail}</td>
                                    <td className="px-3 py-2 text-right">
                                        <span className={`mr-3 inline-block h-2 w-2 rounded-full 
                                            ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    </td>
                                </tr>
                            );
                        })}
                        {participants.length === 0 && (
                            <tr>
                                <td
                                    className="px-3 py-4 text-center text-gray-500"
                                    colSpan={4} >
                                    Ancora nessun partecipante.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal dettagli partecipante */}
            <Modal
                open={!!selectedParticipant}
                onClose={() => setSelectedParticipant(null)}
                title={`Dettagli: ${selectedParticipant?.data.name}`}
            >
                {selectedParticipant && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Email</p>
                                <p className="font-semibold text-sm break-all">{selectedParticipant.data.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Connesso</p>
                                <p className={`font-semibold text-sm ${selectedParticipant.data.isOnline ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {selectedParticipant.data.isOnline ? '🟢 Sì' : '🔴 No'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Crediti Iniziali</p>
                                <p className="font-semibold text-sm text-blue-600">{room.settings.totalPoints}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Crediti Attuali</p>
                                <p className="font-semibold text-lg text-green-600">
                                    {selectedParticipant.data.pointsTotal}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Crediti Spesi</p>
                                <p className="font-semibold text-sm text-orange-600">{selectedParticipant.data.pointsUsed || 0}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Disponibili</p>
                                <p className="font-semibold text-lg text-green-600">
                                    {selectedParticipant.data.pointsTotal - (selectedParticipant.data.pointsUsed || 0)}
                                </p>
                            </div>
                        </div>

                        {/* Round vinti */}
                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3 text-sm">
                                🏆 Round Vinti ({selectedParticipant.data.roundsWon?.length ?? 0})
                            </h4>
                            {(!selectedParticipant.data.roundsWon || selectedParticipant.data.roundsWon.length === 0) ? (
                                <p className="text-xs text-gray-500 italic">Nessun round vinto ancora</p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {selectedParticipant.data.roundsWon.map((round, idx) => (
                                        <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
                                            <p className="font-semibold text-sm text-gray-800">
                                                Q: {round.questionText}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                💰 Speso: <span className="font-bold text-orange-600">{round.pointsAwarded}</span> punti
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                📅 {new Date(round.timestamp).toLocaleString('it-IT')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
