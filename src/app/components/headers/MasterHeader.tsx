'use client';

import Image from 'next/image';
import Link from "next/link";
import { RoomCodeDisplay } from "@/app/components/shared/RoomCodeDisplay";
import { UserDropdown } from "@/app/components/shared/UserDropdown";
import { ThemeSwitch } from "@/app/components/ui/ThemeSwitch";

interface Props {
    roomCode: string;
    roomName?: string;
    userName: string;
    userEmail: string;
    onLogout: () => void;
    onDeleteRoom?: () => void;
}

export default function MasterHeader({ roomCode, roomName, userName, userEmail, onLogout, onDeleteRoom }: Props) {
    return (
        <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-700/50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link href="/">
                            <Image src="/logo.png" alt="Fanta Buzzer" width={28} height={28} className="rounded-lg" />
                        </Link>
                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {roomName || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <RoomCodeDisplay roomCode={roomCode} />
                        <ThemeSwitch />
                        <UserDropdown name={userName} email={userEmail} onLogout={onLogout} onDelete={onDeleteRoom} />
                    </div>
                </div>
            </div>
        </header>
    );
}
