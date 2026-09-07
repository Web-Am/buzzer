'use client';

import Image from 'next/image';
import Link from "next/link";
import { RoomCodeDisplay } from "@/app/components/shared/RoomCodeDisplay";
import { UserDropdown } from "@/app/components/shared/UserDropdown";

interface Props {
    roomCode: string;
    userName: string;
    userEmail: string;
    onLogout: () => void;
}

export default function SpectatorHeader({ roomCode, userName, userEmail, onLogout }: Props) {
    return (
        <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md dark:bg-gray-900/80 dark:border-gray-700/50 shadow-sm dark:shadow-black/20">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link href="/" className="flex items-center gap-2.5 shrink-0">
                            <Image src="/logo.png" alt="Fanta Buzzer" width={32} height={32} className="rounded-lg" />
                            <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                Fanta Buzzer
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <RoomCodeDisplay roomCode={roomCode} />
                        <UserDropdown name={userName} email={userEmail} onLogout={onLogout} />
                    </div>
                </div>
            </div>
        </header>
    );
}
