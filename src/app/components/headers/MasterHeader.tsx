'use client';

import { Zap } from "lucide-react";
import Link from "next/link";
import { RoomCodeDisplay } from "@/app/components/shared/RoomCodeDisplay";
import { UserDropdown } from "@/app/components/shared/UserDropdown";

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
        <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link href="/" className="rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 p-1.5">
                            <Zap size={20} className="text-white" />
                        </Link>
                        <div className="h-6 w-px bg-gray-200" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {roomName || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <RoomCodeDisplay roomCode={roomCode} />
                        <UserDropdown name={userName} email={userEmail} onLogout={onLogout} onDelete={onDeleteRoom} />
                    </div>
                </div>
            </div>
        </header>
    );
}
