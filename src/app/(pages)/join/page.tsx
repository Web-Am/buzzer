'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import { db } from '@/app/lib/firebase';
import { getMasterToken, masterRef, participantRef, sanitizeEmailKey } from '@/app/lib/firebase-utils';
import { validateJoinRoom } from '@/app/lib/game-logic';
import { useUIStore } from '@/app/store/uiStore';
import { Room } from '@/app/types';
import { get, onDisconnect, ref, runTransaction, serverTimestamp, update } from 'firebase/database';
import Header from '@/app/components/shared/Header';

type JoinMode = 'play' | 'watch';

export default function JoinPage() {
    const router = useRouter();
    const { isJoiningRoom, setIsJoiningRoom } = useUIStore();

    const [mode, setMode] = useState<JoinMode>('play');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        roomCode: '',
        name: '',
        email: '',
    });

    useEffect(() => {
        try {
            const saved = localStorage.getItem('fantaLoginData');
            if (saved) {
                const data = JSON.parse(saved);
                setFormData(prev => ({
                    ...prev,
                    roomCode: typeof data.roomCode === 'string' ? data.roomCode : '',
                    name: typeof data.name === 'string' ? data.name : prev.name,
                    email: typeof data.email === 'string' ? data.email : prev.email,
                }));
            }
        } catch { /* localStorage bloccato */ }
    }, []);

    const switchMode = (newMode: JoinMode) => {
        setMode(newMode);
        setFormData((prev) => ({
            ...prev,
            email: '',
            name: ''
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

            const masterSnap = await get(masterRef(userKey));

            if (masterSnap.exists()) {
                const masterData = masterSnap.val() as { room: string; token?: string };

                // Il check master vale solo se si sta entrando nella PROPRIA stanza.
                // Se l'email è master di un'altra stanza, qui entra come partecipante normale.
                if (masterData.room === rc) {
                    const localToken = getMasterToken(masterData.room);

                    // Rientro legittimo del Master (token salvato in questo browser)
                    if (masterData.token && localToken === masterData.token) {
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('fantaLoginData', JSON.stringify({
                                name: formData.name,
                                email: formData.email,
                                roomName: room.name,
                                roomCode: masterData.room,
                            }));
                            localStorage.setItem(`userEmail_${masterData.room}`, formData.email);
                        }
                        setIsJoiningRoom(false);
                        router.push(`/master/${masterData.room}`);
                        return;
                    }

                    setErrorMessage('Questa email è già usata come Master. Se sei il Master rientra dal browser con cui hai creato la stanza, oppure usa un\'altra email.');
                    return;
                }
            }

            const isViewer = mode === 'watch';
            const participantNodeRef = participantRef(rc, userKey);

            const transactionResult = await runTransaction(participantNodeRef, (current) => {
                if (current && current.isOnline === true) {
                    return undefined;
                }

                const preserved = current ?? {};

                return {
                    name: formData.name,
                    email: formData.email,
                    pointsTotal: isViewer
                        ? (preserved.pointsTotal ?? 0)
                        : (preserved.pointsTotal ?? room.settings.totalPoints),
                    pointsUsed: preserved.pointsUsed ?? 0,
                    isOnline: true,
                    isViewer,
                    roundsWon: preserved.roundsWon ?? [],
                    updatedAt: Date.now(),
                };
            });

            if (!transactionResult.committed) {
                setErrorMessage('Questa email è già connessa a questa stanza. Chiudi l\'altra sessione e riprova.');
                return;
            }

            onDisconnect(participantNodeRef)
                .update({
                    isOnline: false,
                    updatedAt: serverTimestamp(),
                })
                .catch(() => {});

            update(roomRef, { updatedAt: Date.now() }).catch(() => {});

            if (typeof window !== 'undefined') {
                localStorage.setItem('fantaLoginData', JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    roomName: room.name,
                    roomCode: rc,
                }));
                localStorage.setItem(`userEmail_${rc}`, formData.email);
            }

            if (isViewer) {
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
        <div className="flex items-center justify-center min-h-[calc(100vh-56px)] bg-gradient-to-br from-primary-50 dark:from-primary-950 via-white dark:via-gray-900 to-secondary-50 dark:to-secondary-950 p-4">
            <Card className="w-full max-w-md">
                <h1 className="mb-6 text-2xl font-bold">
                    {mode === 'play' ? 'Entra in una Stanza' : 'Guarda una Stanza'}
                </h1>

                {/* Mode selector */}
                <div className="mb-6 flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
                    <button
                        type="button"
onClick={() => switchMode('play')}
                         className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${mode === 'play'
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Partecipa
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode('watch')}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${mode === 'watch'
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Solo Visualizzazione
                    </button>
                </div>

                {mode === 'watch' && (
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-300">
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
