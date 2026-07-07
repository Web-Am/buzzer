'use client';

import { ConnectionStatus } from '@/app/components/shared/ConnectionStatus';
import { QuestionDisplay } from '@/app/components/slave/QuestionDisplay';
import { Card } from '@/app/components/ui/Card';
import { ParticipantsTable } from '@/app/components/master/PartecipantsTable';
import { RoundRanking } from '@/app/components/spectator/RoundRanking';
import SpectatorHeader from '@/app/components/headers/SpectatorHeader';
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
    const viewerEmail = userKey ?? '';

    return (
        <>
            <SpectatorHeader
                roomCode={roomCode}
                userName={viewerName}
                userEmail={viewerEmail}
                onLogout={handleLogout}
            />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <ConnectionStatus />
                <main className="container mx-auto px-4 py-8 space-y-6">
                    <div className="grid gap-6 md:grid-cols-[2fr_1.5fr]">
                        <Card>
                            <QuestionDisplay round={room.currentRound} />
                        </Card>
                        <Card>
                            <RoundRanking room={room} />
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
