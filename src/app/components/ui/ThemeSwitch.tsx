'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/app/hooks/useTheme';
import { useEffect, useState } from 'react';

export function ThemeSwitch() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    return (
        <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={mounted ? (theme === 'light' ? 'Attiva tema scuro' : 'Attiva tema chiaro') : 'Cambia tema'}
        >
            {mounted ? (theme === 'light' ? <Moon size={18} /> : <Sun size={18} />) : <div className="w-[18px] h-[18px]" />}
        </button>
    );
}
