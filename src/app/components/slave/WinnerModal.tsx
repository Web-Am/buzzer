'use client';

import { useRoomStore } from "@/app/store/roomStore";
import { Room } from "@/app/types";
import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { useParticleEffect, ParticleLayer } from "@/app/hooks/useConfetti";

interface Props {
    room: Room;
}

export function WinnerModal({ room }: Props) {
    const { userKey } = useRoomStore();
    const [open, setOpen] = useState(false);
    const [isWinner, setIsWinner] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const { particles, fireParticles } = useParticleEffect();

    // Apri/chiudi modal e gestisci confetti
    useEffect(() => {
        const round = room.currentRound;
        if (!round || round.status !== 'FINISHED' || !round.winner || !userKey) {
            setOpen(false);
            setShowConfetti(false);
            return;
        }

        const winner = round.winner === userKey;
        setIsWinner(winner);
        setOpen(true);

        // ScrollToTop immediato
        window.scrollTo(0, 0);

        // Blocca lo scroll
        document.body.style.overflow = 'hidden';

        // Delay per far partire i confetti solo quando il round è scaduto
        const confettiTimeout = setTimeout(() => {
            fireParticles(winner);
            setShowConfetti(true);
        }, 500);

        return () => {
            clearTimeout(confettiTimeout);
            setShowConfetti(false); // blocca le particelle
            document.body.style.overflow = ''; // riabilita lo scroll
        };
    }, [room]);

    if (!room.currentRound) return null;

    const winnerName =
        room.currentRound.winner &&
        room.participants[room.currentRound.winner]?.name;

    return (
        <>
            {/* Background + confetti layer */}
            <ParticleLayer particles={showConfetti ? particles : []} isWinner={isWinner} showBackground={open} />

            {/* Modal sopra background, sotto confetti */}
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={isWinner ? '🎉 HAI VINTO! 🎉' : 'Round concluso'}
                footer={
                    <button
                        onClick={() => setOpen(false)}
                        className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Continua
                    </button>
                }
            >
                {isWinner ? (
                    <div className="space-y-2 text-center">
                        <p className="text-sm">
                            Hai vinto il round e guadagni{' '}
                            <span className="font-semibold">{room.currentRound.winnerPoints} punti.</span>
                        </p>
                        <p className="text-xs text-gray-500">Domanda: {room.currentRound.questionText}</p>
                    </div>
                ) : (
                    <div className="space-y-2 text-center">
                        <p className="text-sm">
                            Il vincitore è{' '}
                            <span className="font-semibold">{winnerName ?? 'Sconosciuto'}</span>
                        </p>
                        <p className="text-xs text-gray-500">Domanda: {room.currentRound.questionText}</p>
                    </div>
                )}
            </Modal>
        </>
    );
}
