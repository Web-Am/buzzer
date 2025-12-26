'use client';

import { ConnectionStatus } from '@/app/components/shared/ConnectionStatus';
import { QuestionDisplay } from '@/app/components/slave/QuestionDisplay';
import { Card } from '@/app/components/ui/Card';
import { Leaderboard } from '@/app/components/ui/Leaderboard';
import { useRoom } from '@/app/hooks/useRoom';
import { useRoomStore } from '@/app/store/roomStore';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function SpectatorPage() {
    const params = useParams<{ roomCode: string }>();
    const roomCode = params.roomCode;
    const { loading } = useRoom(roomCode);
    const { room, setRoomCode, setRole } = useRoomStore();

    useEffect(() => {
        setRoomCode(roomCode);
        setRole('spectator');
    }, [roomCode, setRoomCode, setRole]);

    if (loading) return <p className="p-4">Caricamento...</p>;
    if (!room) return <p className="p-4">Stanza non trovata.</p>;

    return (
        <div className="min-h-screen bg-gray-50">
            <ConnectionStatus />
            <main className="container mx-auto px-4 py-8 space-y-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Spettatore – {roomCode}</h1>
                        <p className="text-xs text-gray-500">
                            Solo visualizzazione – nessuna interazione.
                        </p>
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
            </main>
        </div>
    );
}
