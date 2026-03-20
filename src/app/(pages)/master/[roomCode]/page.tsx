'use client';

import { ParticipantsTable } from '@/app/components/master/PartecipantsTable';
import { RoundControl } from '@/app/components/master/RoundControl';
import { ConnectionStatus } from '@/app/components/shared/ConnectionStatus';
import Header from '@/app/components/shared/Header';
import { RoomCodeDisplay } from '@/app/components/shared/RoomCodeDisplay';
import { UserDropdown } from '@/app/components/shared/UserDropdown';
import { Card } from '@/app/components/ui/Card';
import { Leaderboard } from '@/app/components/ui/Leaderboard';
import { useRoom } from '@/app/hooks/useRoom';
import { sanitizeEmailKey } from '@/app/lib/firebase-utils';
import { useRoomStore } from '@/app/store/roomStore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MasterPage() {

    const router = useRouter();

    const params = useParams<{ roomCode: string }>();
    const roomCode = params.roomCode;
    const { loading } = useRoom(roomCode);
    const { room, setRoomCode, setUserKey, userKey, setRole } = useRoomStore();

    const handleLogout = () => {
        localStorage.removeItem(`userEmail_${roomCode}`);
        router.push('/');
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

    const masterName = room.participants[userKey]?.name || 'Master';
    const masterEmail = userKey;

    return <>
        <Header />
        <div className="min-h-screen bg-gray-50">
            <ConnectionStatus />
            <main className="container mx-auto space-y-6 px-4 py-8 max-w-7xl">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Master</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Gestisci round, partecipanti e punteggi.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <RoomCodeDisplay roomCode={roomCode} />
                        <UserDropdown
                            name={masterName}
                            email={masterEmail}
                            onLogout={handleLogout}
                        />
                    </div>
                </header>

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
    </>
}
