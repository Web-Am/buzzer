'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle, Coins, Calendar, Trash2 } from 'lucide-react';
import { Room, Participant } from "@/app/types";
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ref, remove, update } from 'firebase/database';
import { db } from '@/app/lib/firebase';
import { participantRef, pressRef, currentRoundRef } from '@/app/lib/firebase-utils';
import { useRoomStore } from '@/app/store/roomStore';

interface Props {
    room: Room;
}

function ParticipantEmailRow({ isOnline, email }: { isOnline: boolean; email: string }) {
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-300 uppercase">Email</p>
                <p className="font-semibold text-sm break-all">{email}</p>
            </div>
            <span className={`ml-3 h-3 w-3 rounded-full shrink-0 ${
                isOnline ? 'bg-emerald-500' : 'bg-red-500'
            }`} />
        </div>
    );
}

export function ParticipantsTable({ room }: Props) {
    const { roomCode, role } = useRoomStore();
    const [selectedParticipant, setSelectedParticipant] = useState<{ key: string; data: Participant } | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [roundsExpanded, setRoundsExpanded] = useState(false);
    const [swiped, setSwiped] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [swipedRoundIndex, setSwipedRoundIndex] = useState<number | null>(null);
    const [roundToDelete, setRoundToDelete] = useState<{ index: number; round: Participant['roundsWon'][number] } | null>(null);
    const [showDeleteRoundConfirm, setShowDeleteRoundConfirm] = useState(false);
    const participants = Object.entries(room.participants ?? {});

    const liveSelected = selectedParticipant
        ? (room.participants?.[selectedParticipant.key] ?? null)
        : null;
    const isOnlineSelected = liveSelected?.isOnline === true;
    const displayedIsOnline = liveSelected ? liveSelected.isOnline : (selectedParticipant?.data.isOnline ?? false);
    const viewData = liveSelected ?? selectedParticipant?.data ?? null;

    const handleResetRounds = async () => {
        if (role !== 'master') return;
        if (!roomCode || !selectedParticipant) return;
        await update(ref(db, `rooms/${roomCode}/participants/${selectedParticipant.key}`), {
            roundsWon: [],
            pointsUsed: 0,
        });
        setShowResetConfirm(false);
        setSelectedParticipant(null);
    };

    const handleDeleteParticipant = async () => {
        if (role !== 'master') return;
        if (!roomCode || !selectedParticipant) return;
        if (liveSelected?.isOnline) return;

        try {
            const { key } = selectedParticipant;
            await remove(participantRef(roomCode, key));
            await remove(pressRef(roomCode, key));
            if (room.currentRound?.winner === key) {
                await update(currentRoundRef(roomCode), { winner: null, winnerPoints: null });
            }
            setShowDeleteConfirm(false);
            setSelectedParticipant(null);
            setSwiped(false);
        } catch (err) {
            console.error('Errore eliminazione partecipante:', err);
            alert('Errore durante l\'eliminazione del partecipante.');
        }
    };

    const handleDeleteRound = async () => {
        if (role !== 'master') return;
        if (!roomCode || !selectedParticipant || !roundToDelete) return;

        try {
            const { key } = selectedParticipant;
            const roundsWon = (room.participants?.[key]?.roundsWon ?? selectedParticipant.data.roundsWon ?? []).filter(
                (_, idx) => idx !== roundToDelete.index
            );
            const pointsUsed = roundsWon.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0);
            await update(participantRef(roomCode, key), { roundsWon, pointsUsed });
            setShowDeleteRoundConfirm(false);
            setRoundToDelete(null);
            setSwipedRoundIndex(null);
        } catch (err) {
            console.error('Errore eliminazione round:', err);
            alert('Errore durante l\'eliminazione del round.');
        }
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
<tr key={key} className="border-t cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors" onClick={() => {
                                    setSelectedParticipant({ key, data: p });
                                    setSwiped(false);
                                    setSwipedRoundIndex(null);
                                }}>
                                    <td className="px-3 py-2">{p.name}</td>
                                    <td className="px-3 py-2 text-center">
                                        {p.isViewer ? (
                                            <span className="inline-block rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-300">
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
                                    className="px-3 py-4 text-center text-gray-500 dark:text-gray-300"
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
                onClose={() => {
                    setSelectedParticipant(null);
                    setSwiped(false);
                    setSwipedRoundIndex(null);
                }}
                title={`Dettagli: ${selectedParticipant?.data.name}`}
                footer={
                    role === 'master' && selectedParticipant && viewData && !viewData.isViewer && (
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
                        {/* Email + connection dot (master: swipe left per eliminare) */}
                        {role === 'master' ? (
                            <div className="relative overflow-hidden rounded-lg">
                                {/* Pulsante eliminazione (strato sotto, fisso a destra) */}
                                <button
                                    type="button"
                                    disabled={isOnlineSelected}
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className={`absolute inset-y-0 right-0 flex w-28 items-center justify-center gap-2 text-sm font-semibold transition-colors ${
                                        isOnlineSelected
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                                >
                                    <Trash2 size={16} />
                                    {isOnlineSelected ? 'Connesso' : 'ELIMINA'}
                                </button>

                                {/* Contenuto email (strato sopra, scorre a sinistra) */}
                                <motion.div
                                    drag="x"
                                    dragConstraints={{ left: -112, right: 0 }}
                                    dragElastic={0.15}
                                    dragMomentum={false}
                                    onDragEnd={(_, info) => {
                                        if (info.offset.x < -30 || info.velocity.x < -400) {
                                            setSwiped(true);
                                        } else if (info.offset.x > 30 || info.velocity.x > 400) {
                                            setSwiped(false);
                                        }
                                    }}
                                    animate={{ x: swiped ? -112 : 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className="relative z-10 bg-white dark:bg-gray-800 px-3 py-2 cursor-grab active:cursor-grabbing"
                                >
                                    <ParticipantEmailRow
                                        isOnline={displayedIsOnline}
                                        email={viewData?.email ?? ''}
                                    />
                                    {!swiped && (
                                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                                            <ChevronDown className="w-3 h-3 rotate-90" />
                                            scorri a sinistra per eliminare
                                        </span>
                                    )}
                                </motion.div>
                            </div>
                        ) : (
                            <ParticipantEmailRow
                                isOnline={displayedIsOnline}
                                email={viewData?.email ?? ''}
                            />
                        )}

                        <hr />

                        {/* Credits + Role */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-300 uppercase">Crediti</p>
                                <p className="font-semibold text-sm">
                                    {viewData ? (viewData.pointsTotal - (viewData.pointsUsed || 0)) : 0} / {viewData?.pointsTotal ?? 0}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-300 uppercase">Ruolo</p>
                                <p className="font-semibold text-sm">
                                    {viewData?.isViewer ? (
                                        <span className="text-gray-500 dark:text-gray-300">Spettatore</span>
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
                                        {viewData?.roundsWon?.length ?? 0}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                                        roundsExpanded ? 'rotate-180' : ''
                                    }`} />
                                </span>
                            </button>
                            {roundsExpanded && (
                                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                                    {(viewData?.roundsWon && viewData.roundsWon.length === 0) ? (
                                        <p className="text-xs text-gray-500 dark:text-gray-300 italic">Nessun round vinto ancora</p>
                                    ) : (
                                        viewData?.roundsWon?.map((round, idx) => {
                                            const cardContent = (
                                                <>
                                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                                                        <HelpCircle size={16} className="inline mr-1 text-blue-500 -mt-0.5" />
                                                        {round.questionText}
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                                        <Coins size={14} className="inline mr-1 text-orange-500 -mt-0.5" />
                                                        Spesi: <span className="font-bold text-orange-600">{round.pointsAwarded}</span> crediti
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-300 mt-1">
                                                        <Calendar size={14} className="inline mr-1 text-gray-400 -mt-0.5" />
                                                        {new Date(round.timestamp).toLocaleString('it-IT')}
                                                    </p>
                                                </>
                                            );

                                            if (role !== 'master') {
                                                return (
                                                    <div key={idx} className="bg-gradient-to-r from-blue-50 dark:from-blue-900 to-purple-50 dark:to-purple-900 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                                                        {cardContent}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={idx} className="relative overflow-hidden rounded-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setRoundToDelete({ index: idx, round });
                                                            setShowDeleteRoundConfirm(true);
                                                        }}
                                                        className="absolute inset-y-0 right-0 flex w-24 items-center justify-center gap-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                        ELIMINA
                                                    </button>

                                                    <motion.div
                                                        drag="x"
                                                        dragConstraints={{ left: -96, right: 0 }}
                                                        dragElastic={0.15}
                                                        dragMomentum={false}
                                                        onDragEnd={(_, info) => {
                                                            if (swipedRoundIndex === idx) {
                                                                if (info.offset.x > 30 || info.velocity.x > 400) {
                                                                    setSwipedRoundIndex(null);
                                                                }
                                                            } else {
                                                                if (info.offset.x < -30 || info.velocity.x < -400) {
                                                                    setSwipedRoundIndex(idx);
                                                                }
                                                            }
                                                        }}
                                                        animate={{ x: swipedRoundIndex === idx ? -96 : 0 }}
                                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                        className="relative z-10 bg-gradient-to-r from-blue-50 dark:from-blue-900 to-purple-50 dark:to-purple-900 rounded-lg p-3 border border-blue-100 dark:border-blue-800 cursor-grab active:cursor-grabbing"
                                                    >
                                                        {cardContent}
                                                    </motion.div>
                                                </div>
                                            );
                                        })
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
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Sei sicuro di voler resettare tutti i round vinti di{' '}
                    <strong className="text-gray-900 dark:text-gray-100">{selectedParticipant?.data.name}</strong>?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                    Questa azione cancellerà la cronologia delle vittorie e ripristinerà tutti i crediti spesi.
                </p>
            </Modal>

            {/* Modal conferma eliminazione round */}
            <Modal
                open={showDeleteRoundConfirm}
                onClose={() => setShowDeleteRoundConfirm(false)}
                title="Eliminare round vinto?"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowDeleteRoundConfirm(false)}>Annulla</Button>
                        <Button
                            onClick={handleDeleteRound}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Conferma Eliminazione
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Vuoi eliminare il round vinto{' '}
                    <strong className="text-gray-900 dark:text-gray-100">"{roundToDelete?.round.questionText}"</strong> di{' '}
                    <strong className="text-gray-900 dark:text-gray-100">{selectedParticipant?.data.name}</strong>?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                    I crediti spesi ({roundToDelete?.round.pointsAwarded}) verranno rimborsati.
                </p>
            </Modal>

            {/* Modal conferma eliminazione */}
            <Modal
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Eliminare partecipante?"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Annulla</Button>
                        <Button
                            onClick={handleDeleteParticipant}
                            disabled={isOnlineSelected}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Conferma Eliminazione
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Vuoi cancellare <strong className="text-gray-900 dark:text-gray-100">{selectedParticipant?.data.name}</strong> dalla stanza?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                    Verranno eliminati anche tutti i suoi dati (round vinti, crediti spesi e pressioni). Questa azione è irreversibile.
                </p>
            </Modal>
        </div>
    );
}
