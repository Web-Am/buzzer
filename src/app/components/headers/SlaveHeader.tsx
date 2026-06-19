'use client';

import { Zap, Coins, Target } from "lucide-react";
import Link from "next/link";
import { RoomCodeDisplay } from "@/app/components/shared/RoomCodeDisplay";
import { UserDropdown } from "@/app/components/shared/UserDropdown";

interface Props {
    roomCode: string;
    roomName?: string;
    userName: string;
    userEmail: string;
    pointsAvail: number;
    userCumulativeBid: number;
    pointsRemaining: number;
    isActive: boolean;
    onLogout: () => void;
}

export default function SlaveHeader({
    roomCode,
    roomName,
    userName,
    userEmail,
    pointsAvail,
    userCumulativeBid,
    pointsRemaining,
    isActive,
    onLogout,
}: Props) {
    return (
        <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link href="/">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 p-1.5">
                                    <Zap size={20} className="text-white" />
                                </div>
                                <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent hidden sm:block">
                                    Fanta Buzzer
                                </h1>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2 text-sm">
                            <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                                <Coins size={14} />
                                {pointsAvail}
                            </span>
                            {isActive && userCumulativeBid > 0 && (
                                <span className="flex items-center gap-1 text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full font-medium">
                                    <Target size={14} />
                                    {userCumulativeBid}
                                </span>
                            )}
                        </div>
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
