'use client';

import Image from 'next/image';
import { Coins, Target } from "lucide-react";
import Link from "next/link";
import { RoomCodeDisplay } from "@/app/components/shared/RoomCodeDisplay";
import { UserDropdown } from "@/app/components/shared/UserDropdown";
import { ThemeSwitch } from "@/app/components/ui/ThemeSwitch";

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

                        <div className="flex items-center gap-2 text-sm">
                            <span className="flex items-center gap-1.5 text-green-700 dark:text-green-200 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full font-semibold">
                                <Coins size={14} />
                                {pointsAvail}
                            </span>
                            {isActive && userCumulativeBid > 0 && (
                                <span className="flex items-center gap-1.5 text-orange-700 dark:text-orange-200 bg-orange-50 dark:bg-orange-900/30 px-2.5 py-1 rounded-full font-semibold">
                                    <Target size={14} />
                                    {userCumulativeBid}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <RoomCodeDisplay roomCode={roomCode} />
                        <ThemeSwitch />
                        <UserDropdown name={userName} email={userEmail} onLogout={onLogout} />
                    </div>
                </div>
            </div>
        </header>
    );
}
