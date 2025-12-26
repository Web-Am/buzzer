import { useState, useEffect } from "react";
import { Button } from "../ui/Button";

interface Props {
    roomCode: string;
}

export function RoomCodeDisplay({ roomCode }: Props) {
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(roomCode);
            setShowToast(true);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative flex items-center gap-2">
            <span className="rounded-xl bg-gray-100 px-3 py-1 font-mono text-lg">
                {roomCode}
            </span>
            <Button variant="ghost" size="sm" onClick={copy}>
                Copia
            </Button>

            <div
                className={`fixed bottom-12 left-1/2 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg transition-opacity duration-200 ${showToast ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                Codice copiato!
            </div>
        </div>
    );
}