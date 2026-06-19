'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle, Coins, Calendar } from 'lucide-react';
import { Room, Participant } from "@/app/types";
import { Modal } from '../ui/Modal';

interface Props {
    room: Room;
}

export function ParticipantsTable({ room }: Props) {
    const [selectedParticipant, setSelectedParticipant] = useState<{ key: string; data: Participant } | null>(null);
    const [roundsExpanded, setRoundsExpanded] = useState(false);
    const participants = Object.entries(room.participants ?? {});

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Partecipanti</h3>
            <div className="overflow-x-auto rounded-xl border">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left">Nome</th>
                                <th className="px-3 py-2 text-center">Ruolo</th>
                                <th className="px-3 py-2 text-right">Crediti</th>
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
                                    <td className="px-3 py-2 text-center">
                                        {p.isViewer ? (
                                            <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                                                Viewer
                                            </span>
                                        ) : (
                                            <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                Player
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium">{avail}</td>
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
                        {/* Email + connection dot */}
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 uppercase">Email</p>
                                <p className="font-semibold text-sm break-all">{selectedParticipant.data.email}</p>
                            </div>
                            <span className={`ml-3 h-3 w-3 rounded-full shrink-0 ${
                                selectedParticipant.data.isOnline ? 'bg-emerald-500' : 'bg-red-500'
                            }`} />
                        </div>

                        <hr />

                        {/* Credits + Role */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Crediti</p>
                                <p className="font-semibold text-sm">
                                    {selectedParticipant.data.pointsTotal - (selectedParticipant.data.pointsUsed || 0)} / {selectedParticipant.data.pointsTotal}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">Ruolo</p>
                                <p className="font-semibold text-sm">
                                    {selectedParticipant.data.isViewer ? (
                                        <span className="text-gray-500">Spettatore</span>
                                    ) : (
                                        <span className="text-blue-600">Giocatore</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <hr />

                        {/* Round vinti - collapsible */}
                        <div>
                            <button
                                onClick={() => setRoundsExpanded(p => !p)}
                                className="flex items-center justify-between w-full text-left group"
                            >
                                <span className="font-semibold text-sm">🏆 Round Vinti</span>
                                <span className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 min-w-[1.5rem]">
                                        {selectedParticipant.data.roundsWon?.length ?? 0}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                        roundsExpanded ? 'rotate-180' : ''
                                    }`} />
                                </span>
                            </button>
                            {roundsExpanded && (
                                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                                    {(!selectedParticipant.data.roundsWon || selectedParticipant.data.roundsWon.length === 0) ? (
                                        <p className="text-xs text-gray-500 italic">Nessun round vinto ancora</p>
                                    ) : (
                                        selectedParticipant.data.roundsWon.map((round, idx) => (
                                            <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
                                                <p className="font-semibold text-sm text-gray-800">
                                                    <HelpCircle size={16} className="inline mr-1 text-blue-500 -mt-0.5" />
                                                    {round.questionText}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    <Coins size={14} className="inline mr-1 text-orange-500 -mt-0.5" />
                                                    Spesi: <span className="font-bold text-orange-600">{round.pointsAwarded}</span> crediti
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    <Calendar size={14} className="inline mr-1 text-gray-400 -mt-0.5" />
                                                    {new Date(round.timestamp).toLocaleString('it-IT')}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
