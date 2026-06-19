'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle, Coins, Calendar } from 'lucide-react';
import { Room, Participant } from "@/app/types";
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ref, update } from 'firebase/database';
import { db } from '@/app/lib/firebase';
import { useRoomStore } from '@/app/store/roomStore';

interface Props {
    room: Room;
}

export function ParticipantsTable({ room }: Props) {
    const { roomCode, role } = useRoomStore();
    const [selectedParticipant, setSelectedParticipant] = useState<{ key: string; data: Participant } | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [roundsExpanded, setRoundsExpanded] = useState(false);
    const participants = Object.entries(room.participants ?? {});

    const handleResetRounds = async () => {
        if (!roomCode || !selectedParticipant) return;
        await update(ref(db, `rooms/${roomCode}/participants/${selectedParticipant.key}`), {
            roundsWon: [],
            pointsUsed: 0,
        });
        setShowResetConfirm(false);
        setSelectedParticipant(null);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Partecipanti</h3>
            <div className="overflow-x-auto rounded-xl border">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
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
                                <tr key={key} className="border-t cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors" onClick={() => setSelectedParticipant({ key, data: p })}>
                                    <td className="px-3 py-2">{p.name}</td>
                                    <td className="px-3 py-2 text-center">
                                        {p.isViewer ? (
                                            <span className="inline-block rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Viewer
                                            </span>
                                        ) : (
                                            <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
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
                                    className="px-3 py-4 text-center text-gray-500 dark:text-gray-400"
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
                footer={
                    role === 'master' && selectedParticipant && !selectedParticipant.data.isViewer && (
                        <Button
                            variant="ghost"
                            onClick={() => setShowResetConfirm(true)}
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                            Reset Round Vinti
                        </Button>
                    )
                }
            >
                    {selectedParticipant && (
                    <div className="space-y-4">
                        {/* Email + connection dot */}
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Email</p>
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
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Crediti</p>
                                <p className="font-semibold text-sm">
                                    {selectedParticipant.data.pointsTotal - (selectedParticipant.data.pointsUsed || 0)} / {selectedParticipant.data.pointsTotal}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Ruolo</p>
                                <p className="font-semibold text-sm">
                                    {selectedParticipant.data.isViewer ? (
                                        <span className="text-gray-500 dark:text-gray-400">Spettatore</span>
                                    ) : (
                                        <span className="text-blue-600 dark:text-blue-400">Giocatore</span>
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
                                    <span className="inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[1.5rem]">
                                        {selectedParticipant.data.roundsWon?.length ?? 0}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                                        roundsExpanded ? 'rotate-180' : ''
                                    }`} />
                                </span>
                            </button>
                            {roundsExpanded && (
                                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                                    {(!selectedParticipant.data.roundsWon || selectedParticipant.data.roundsWon.length === 0) ? (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">Nessun round vinto ancora</p>
                                    ) : (
                                        selectedParticipant.data.roundsWon.map((round, idx) => (
                                            <div key={idx} className="bg-gradient-to-r from-blue-50 dark:from-blue-900/30 to-purple-50 dark:to-purple-900/30 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                                                    <HelpCircle size={16} className="inline mr-1 text-blue-500 -mt-0.5" />
                                                    {round.questionText}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                    <Coins size={14} className="inline mr-1 text-orange-500 -mt-0.5" />
                                                    Spesi: <span className="font-bold text-orange-600">{round.pointsAwarded}</span> crediti
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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

            {/* Modal conferma reset */}
            <Modal
                open={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                title="Reset Round Vinti"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>Annulla</Button>
                        <Button onClick={handleResetRounds} className="bg-red-600 text-white hover:bg-red-700">Conferma Reset</Button>
                    </>
                }
            >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sei sicuro di voler resettare tutti i round vinti di{' '}
                    <strong className="text-gray-900 dark:text-gray-100">{selectedParticipant?.data.name}</strong>?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Questa azione cancellerà la cronologia delle vittorie e ripristinerà tutti i crediti spesi.
                </p>
            </Modal>
        </div>
    );
}
