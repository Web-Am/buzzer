'use client';

import Header from '@/app/components/shared/Header';
import { ConnectionStatus } from '@/app/components/shared/ConnectionStatus';
import { QuestionDisplay } from '@/app/components/slave/QuestionDisplay';
import { Card } from '@/app/components/ui/Card';
import { Leaderboard } from '@/app/components/ui/Leaderboard';
import { ParticipantsTable } from '@/app/components/master/PartecipantsTable';
import { UserDropdown } from '@/app/components/shared/UserDropdown';
import { useRoom } from '@/app/hooks/useRoom';
import { useRoomStore } from '@/app/store/roomStore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SpectatorPage() {
    const params = useParams<{ roomCode: string }>();
    const router = useRouter();
    const roomCode = params.roomCode;
    const { loading } = useRoom(roomCode);
    const { room, setRoomCode, setRole, userKey, setUserKey } = useRoomStore();

    useEffect(() => {
        setRoomCode(roomCode);
        setRole('spectator');

        const stored = localStorage.getItem(`userEmail_${roomCode}`);
        if (stored) {
            setUserKey(stored);
        }
    }, [roomCode, setRoomCode, setRole, setUserKey]);

    const handleLogout = () => {
        localStorage.removeItem(`userEmail_${roomCode}`);
        router.push('/');
    };

    if (loading) return <p className="p-4">Caricamento...</p>;
    if (!room) return <p className="p-4">Stanza non trovata.</p>;

    const viewerName = userKey && room.participants?.[userKey]?.name || 'Spettatore';

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <ConnectionStatus />
            <main className="container mx-auto px-4 py-8 space-y-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {room.name || 'Stanza'} – {roomCode}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Solo visualizzazione – nessuna interazione.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserDropdown
                            name={viewerName}
                            email={userKey || ''}
                            onLogout={handleLogout}
                        />
                    </div>
                </header>

                <div className="grid gap-6 md:grid-cols-[2fr_1.5fr]">
                    <Card>
                        <QuestionDisplay round={room.currentRound} />
                    </Card>
                    <Card>
                        <Leaderboard room={room} />
                    </Card>
                </div>

                <Card className="p-6">
                    <ParticipantsTable room={room} />
                </Card>
            </main>
        </div>
        </>
    );
}
