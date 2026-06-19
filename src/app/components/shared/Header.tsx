'use client';

import Image from 'next/image';
import Link from "next/link";
import { ThemeSwitch } from "@/app/components/ui/ThemeSwitch";

export default function Header() {
    return <div className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
                <Link href="/">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Fanta Buzzer" width={32} height={32} className="rounded-lg" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            Fanta Buzzer
                        </h1>
                    </div>
                </Link>
                <ThemeSwitch />
            </div>
        </div>
    </div>
}