'use client';

import { QuestionDisplay } from '@/app/components/slave/QuestionDisplay';
import { Card } from '@/app/components/ui/Card';
import { ParticipantsTable } from '@/app/components/master/PartecipantsTable';
import { RoundRanking } from '@/app/components/spectator/RoundRanking';
import SpectatorHeader from '@/app/components/headers/SpectatorHeader';
import { usePresence } from '@/app/hooks/usePresence';
import { useRoom } from '@/app/hooks/useRoom';
import { participantRef } from '@/app/lib/firebase-utils';
import { useRoomStore } from '@/app/store/roomStore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { update } from 'firebase/database';

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
        if (userKey && roomCode) {
            update(participantRef(roomCode, userKey), { isOnline: false }).catch(() => {});
        }
        localStorage.removeItem(`userEmail_${roomCode}`);
        router.push('/');
    };

    usePresence(roomCode, userKey);

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Caricamento...</p>
            </div>
        </div>
    );
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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
