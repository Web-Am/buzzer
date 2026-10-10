'use client';

import { ParticipantsTable } from '@/app/components/master/PartecipantsTable';
import { RoundControl } from '@/app/components/master/RoundControl';
import MasterHeader from '@/app/components/headers/MasterHeader';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Modal } from '@/app/components/ui/Modal';
import { Leaderboard } from '@/app/components/ui/Leaderboard';
import { useRoom } from '@/app/hooks/useRoom';
import { useRoomStore } from '@/app/store/roomStore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { get, ref, remove } from 'firebase/database';
import { db } from '@/app/lib/firebase';
import { clearMasterToken, getMasterToken, masterRef, sanitizeEmailKey } from '@/app/lib/firebase-utils';

export default function MasterPage() {

    const router = useRouter();

    const params = useParams<{ roomCode: string }>();
    const roomCode = params.roomCode;
    const { loading } = useRoom(roomCode);
    const { room, setRoomCode, setUserKey, userKey, setRole } = useRoomStore();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    const handleLogout = () => {
        localStorage.removeItem(`userEmail_${roomCode}`);
        router.push('/');
    };

    const handleDeleteRoom = async () => {
        if (!roomCode || !userKey) return;

        try {
            await remove(ref(db, `rooms/${roomCode}`));
            await remove(ref(db, `masters/${userKey}`));
            clearMasterToken(roomCode);
            localStorage.removeItem(`userEmail_${roomCode}`);
            router.push('/');
        } catch (err) {
            console.error('Errore eliminazione stanza:', err);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const verify = async () => {
            if (!roomCode) return;

            setRoomCode(roomCode);
            setRole('master');

            const stored = localStorage.getItem(`userEmail_${roomCode}`);
            if (!stored) {
                alert("Non hai eseguito correttamente l'accesso");
                router.push('/');
                return;
            }

            setUserKey(stored);

            try {
                const masterSnap = await get(masterRef(sanitizeEmailKey(stored)));
                const masterData = masterSnap.exists()
                    ? (masterSnap.val() as { room?: string; token?: string })
                    : null;
                const localToken = getMasterToken(roomCode);

                const valid = !!masterData &&
                    masterData.room === roomCode &&
                    !!masterData.token &&
                    masterData.token === localToken;

                if (cancelled) return;

                if (valid) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                    alert('Non sei autorizzato come Master di questa stanza.');
                    router.push('/');
                }
            } catch (err) {
                console.error('Errore verifica master:', err);
                if (!cancelled) {
                    setAuthorized(false);
                    router.push('/');
                }
            }
        };

        verify();
        return () => { cancelled = true; };
    }, [roomCode, router, setRoomCode, setRole, setUserKey]);

    if (loading || authorized === null) return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Caricamento...</p>
            </div>
        </div>
    );
    if (!authorized) return <p className="p-4">Non autorizzato.</p>;
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
                <p className="text-sm text-gray-600 dark:text-gray-300">
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
