'use client';

import { ParticipantsTable } from '@/app/components/master/PartecipantsTable';
import { RoundControl } from '@/app/components/master/RoundControl';
import { ConnectionStatus } from '@/app/components/shared/ConnectionStatus';
import MasterHeader from '@/app/components/headers/MasterHeader';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Modal } from '@/app/components/ui/Modal';
import { Leaderboard } from '@/app/components/ui/Leaderboard';
import { useRoom } from '@/app/hooks/useRoom';
import { useRoomStore } from '@/app/store/roomStore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ref, remove } from 'firebase/database';
import { db } from '@/app/lib/firebase';

export default function MasterPage() {

    const router = useRouter();

    const params = useParams<{ roomCode: string }>();
    const roomCode = params.roomCode;
    const { loading } = useRoom(roomCode);
    const { room, setRoomCode, setUserKey, userKey, setRole } = useRoomStore();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem(`userEmail_${roomCode}`);
        router.push('/');
    };

    const handleDeleteRoom = async () => {
        if (!roomCode || !userKey) return;

        try {
            await remove(ref(db, `rooms/${roomCode}`));
            await remove(ref(db, `masters/${userKey}`));
            localStorage.removeItem(`userEmail_${roomCode}`);
            router.push('/');
        } catch (err) {
            console.error('Errore eliminazione stanza:', err);
        }
    };

    useEffect(() => {

        if (!roomCode)
            return;

        setRoomCode(roomCode);
        setRole('master');
        const stored = localStorage.getItem(`userEmail_${roomCode}`);
        if (!stored) {
            alert("Non hai eseguito correttamente l'accesso");
            router.push(`/`);
        }
        else
            setUserKey(stored);
    }, [roomCode]);

    if (loading) return <p className="p-4">Caricamento...</p>;
    if (!room) return <p className="p-4">Stanza non trovata.</p>;

    const masterName = (userKey && room.participants?.[userKey]?.name) || 'Master';
    const masterEmail = userKey ?? '';

    return <>
        <MasterHeader
            roomCode={roomCode}
            roomName={room.name}
            userName={masterName}
            userEmail={masterEmail}
            onLogout={handleLogout}
            onDeleteRoom={() => setShowDeleteModal(true)}
        />
        <div className="min-h-screen bg-gray-50">
            <ConnectionStatus />
            <main className="container mx-auto space-y-6 px-4 py-8 max-w-7xl">

                <div className="grid gap-6 lg:grid-cols-1">
                    <Card className="p-6">
                        <RoundControl roomCode={roomCode} room={room} />
                    </Card>
                </div>

                <Card className="p-6">
                    <ParticipantsTable room={room} />
                </Card>

            </main>
        </div>

        <Modal
            open={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Eliminare la stanza?"
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Sei sicuro di voler eliminare la stanza <strong>{roomCode}</strong>?
                    Tutti i dati, crediti e cronologie andranno persi.
                </p>
                <p className="text-sm font-semibold text-red-600">
                    Questa azione è irreversibile.
                </p>
                <div className="flex gap-3 justify-end">
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        Annulla
                    </Button>
                    <Button
                        onClick={handleDeleteRoom}
                        className="bg-red-600 text-white hover:bg-red-700"
                    >
                        Elimina Permanentemente
                    </Button>
                </div>
            </div>
        </Modal>
    </>
}
