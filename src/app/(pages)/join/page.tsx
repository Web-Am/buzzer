'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import { db } from '@/app/lib/firebase';
import { sanitizeEmailKey } from '@/app/lib/firebase-utils';
import { validateJoinRoom } from '@/app/lib/game-logic';
import { useUIStore } from '@/app/store/uiStore';
import { Room } from '@/app/types';
import { get, ref, update } from 'firebase/database';
import Header from '@/app/components/shared/Header';

type JoinMode = 'play' | 'watch';

export default function JoinPage() {
    const router = useRouter();
    const { isJoiningRoom, setIsJoiningRoom } = useUIStore();

    const [mode, setMode] = useState<JoinMode>('play');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({ roomCode: '', name: 'Marco', email: 'andrea.air14@gmail.com' });

    const switchMode = (newMode: JoinMode) => {
        setMode(newMode);
        setFormData((prev) => ({
            ...prev,
            email: newMode === 'play' ? 'andrea.air14@gmail.com' : 'andrea.air1@gmail.com',
            name: newMode === 'play' ? 'Marco' : 'Luca'
        }));
        setErrors({});
        setErrorMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const rc = formData.roomCode.toUpperCase();

        const validation = validateJoinRoom({
            ...formData,
            roomCode: rc
        });

        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }

        setErrors({});
        setErrorMessage(null);
        setIsJoiningRoom(true);

        try {
            const roomRef = ref(db, `rooms/${rc}`);
            const snapshot = await get(roomRef);

            if (!snapshot.exists()) {
                setErrorMessage('Stanza non trovata.');
                return;
            }

            const room = snapshot.val() as Room;
            const userKey = sanitizeEmailKey(formData.email);

            const masterRef = ref(db, `masters/${userKey}`);
            const masterSnap = await get(masterRef);

            if (typeof window !== 'undefined') {
                localStorage.setItem(`userEmail_${rc}`, formData.email);
            }

            if (masterSnap.exists()) {
                setIsJoiningRoom(false);
                router.push(`/master/${masterSnap.val().room}`);
                return;
            }

            const existing = room.participants?.[userKey];

            if (mode === 'watch') {
                await update(roomRef, {
                    [`participants/${userKey}`]: {
                        name: formData.name,
                        email: formData.email,
                        pointsTotal: existing?.pointsTotal ?? 0,
                        pointsUsed: existing?.pointsUsed ?? 0,
                        isOnline: true,
                        isViewer: true,
                        roundsWon: existing?.roundsWon ?? [],
                    },
                    updatedAt: Date.now()
                });
            } else {
                await update(roomRef, {
                    [`participants/${userKey}`]: {
                        name: formData.name,
                        email: formData.email,
                        pointsTotal: existing?.pointsTotal ?? room.settings.totalPoints,
                        pointsUsed: existing?.pointsUsed ?? 0,
                        isOnline: true,
                        isViewer: false,
                        roundsWon: existing?.roundsWon ?? [],
                    },
                    updatedAt: Date.now()
                });
            }

            if (mode === 'watch') {
                router.push(`/spectator/${rc}`);
            } else {
                router.push(`/slave/${rc}`);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage('Errore di connessione.');
        } finally {
            setIsJoiningRoom(false);
        }
    };

    return <>
        <Header />
        <div className="flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <h1 className="mb-6 text-2xl font-bold">
                    {mode === 'play' ? 'Entra in una Stanza' : 'Guarda una Stanza'}
                </h1>

                {/* Mode selector */}
                <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
                    <button
                        type="button"
                        onClick={() => switchMode('play')}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${mode === 'play'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Partecipa
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode('watch')}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${mode === 'watch'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Solo Visualizzazione
                    </button>
                </div>

                {mode === 'watch' && (
                    <p className="mb-4 text-sm text-gray-500">
                        Potrai vedere la domanda, la classifica e i punteggi in tempo reale, senza poter votare.
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Codice Stanza"
                        value={formData.roomCode}
                        onChange={(e) =>
                            setFormData((s) => ({ ...s, roomCode: e.target.value.toUpperCase() }))
                        }
                        error={errors.roomCode}
                        maxLength={6}
                    />
                    <Input
                        label="Nome"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData((s) => ({ ...s, name: e.target.value }))
                        }
                        error={errors.name}
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData((s) => ({ ...s, email: e.target.value }))
                        }
                        error={errors.email}
                    />

                    {errorMessage && (
                        <p className="text-sm text-red-500">{errorMessage}</p>
                    )}

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        isLoading={isJoiningRoom}
                    >
                        {mode === 'play' ? 'Entra nella Stanza' : 'Entra come Spettatore'}
                    </Button>
                </form>
            </Card>
        </div>
    </>
}
