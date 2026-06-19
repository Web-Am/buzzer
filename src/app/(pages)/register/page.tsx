'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import { useCreateRoom } from '@/app/hooks/useCreateRoom';
import { validateRoomCreation } from '@/app/lib/game-logic';
import { useUIStore } from '@/app/store/uiStore';
import Header from '@/app/components/shared/Header';

export default function RegisterPage() {
    const router = useRouter();
    const { createRoom } = useCreateRoom();
    const { isCreatingRoom } = useUIStore();

    const [formData, setFormData] = useState({
        name: 'Andrea', roomName: 'Fanta Quiz',
        email: 'andrea.air144@gmail.com',
        totalPoints: 300, timerCountdown: 10,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = validateRoomCreation({
            ...formData, timerCountdown: formData.timerCountdown * 1000
        });

        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }

        setErrors({});
        setSubmitError(null);

        const roomCode = await createRoom({ ...formData, timerCountdown: formData.timerCountdown * 1000 });

        if (!roomCode) {
            setSubmitError('Errore durante la creazione della stanza. Riprova.');
            return;
        }

        localStorage.setItem(`userEmail_${roomCode}`, formData.email);
        router.push(`/master/${roomCode}`);
    };

    return <>
        <Header />
        <div className="flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <h1 className="mb-6 text-2xl font-bold">Crea Stanza</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nome Stanza"
                        type="text"
                        value={formData.roomName}
                        onChange={(e) =>
                            setFormData((s) => ({ ...s, roomName: e.target.value }))
                        }
                        error={errors.roomName}
                        required
                    />

                    <Input
                        label="Il tuo Nome"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData((s) => ({ ...s, name: e.target.value }))
                        }
                        error={errors.name}
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData((s) => ({ ...s, email: e.target.value }))
                        }
                        error={errors.email}
                        required
                    />

                    <div>
                        <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                            Budget Punti: {formData.totalPoints}
                        </label>
                        <input
                            type="range"
                            min={100}
                            max={1000}
                            step={50}
                            value={formData.totalPoints}
                            onChange={(e) =>
                                setFormData((s) => ({
                                    ...s,
                                    totalPoints: Number(e.target.value)
                                }))
                            }
                            className="w-full accent-primary-600 dark:accent-primary-400"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                            Timer: {formData.timerCountdown} secondi
                        </label>
                        <input
                            type="range"
                            min={3}
                            max={30}
                            step={1}
                            value={formData.timerCountdown}
                            onChange={(e) =>
                                setFormData((s) => ({
                                    ...s,
                                    timerCountdown: Number(e.target.value)
                                }))
                            }
                            className="w-full accent-primary-600 dark:accent-primary-400"
                        />
                    </div>

                    {submitError && (
                        <p className="text-sm text-red-500 text-center">{submitError}</p>
                    )}

                    <Button type="submit" size="lg" className="w-full" isLoading={isCreatingRoom}>
                        Crea Stanza
                    </Button>
                </form>
            </Card>
        </div>
    </>
}
