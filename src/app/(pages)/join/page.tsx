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
import { Room, Participant } from '@/app/types';
import { get, ref, update } from 'firebase/database';
import Header from '@/app/components/shared/Header';

export default function JoinPage() {
  const router = useRouter();
  const { isJoiningRoom, setIsJoiningRoom } = useUIStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ roomCode: 'KAGFCJ', name: 'marco', email: 'andrea.air14@gmail.com' });

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


      // 🔍 Controllo se esiste già un master
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

      if (!room.participants?.[userKey]) {
        const participant: Participant = {
          name: formData.name,
          email: formData.email,
          pointsTotal: room.settings.totalPoints,
          pointsUsed: 0,
          isOnline: false,
          roundsWon: []
        };

        await update(roomRef, {
          [`participants/${userKey}`]: participant,
          updatedAt: Date.now()
        });
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(`userEmail_${rc}`, formData.email);
      }

      router.push(`/slave/${rc}`);
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
        <h1 className="mb-6 text-2xl font-bold">Entra in una Stanza</h1>
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
            Entra nella Stanza
          </Button>
        </form>
      </Card>
    </div>
  </>
}
