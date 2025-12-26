'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import { useCreateRoom } from '@/app/hooks/useCreateRoom';
import { validateRoomCreation } from '@/app/lib/game-logic';
import { useUIStore } from '@/app/store/uiStore';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const { createRoom } = useCreateRoom();
    const { isCreatingRoom } = useUIStore();

    const [formData, setFormData] = useState({
        name: 'andrea', email: 'andrea.air144@gmail.com',
        totalPoints: 300, timerCountdown: 10,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

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

        const roomCode = await createRoom({ ...formData, timerCountdown: formData.timerCountdown * 1000 });

        localStorage.setItem(`userEmail_${roomCode}`, formData.email);
        if (roomCode)
            router.push(`/master/${roomCode}`);
    };

    return <>
        <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 p-2">
                                <Zap size={24} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                Fanta Buzzer
                            </h1>
                        </div>
                    </Link>
                </div>
            </div>
        </header>
        <div className="flex  items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <h1 className="mb-6 text-2xl font-bold">Crea Stanza</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nome"
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
                        <label className="mb-2 block text-sm font-medium">
                            Punti Totali: {formData.totalPoints}
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
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
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
                            className="w-full"
                        />
                    </div>

                    <Button type="submit" size="lg" className="w-full" isLoading={isCreatingRoom}>
                        Crea Stanza
                    </Button>
                </form>
            </Card>
        </div>
    </>
}
