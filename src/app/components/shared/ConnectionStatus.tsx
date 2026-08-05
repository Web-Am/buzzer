'use client';

import { useEffect, useState } from 'react';

export function ConnectionStatus() {
    const [online, setOnline] = useState(true);

    useEffect(() => {
        const update = () => setOnline(navigator.onLine);
        update();
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        return () => {
            window.removeEventListener('online', update);
            window.removeEventListener('offline', update);
        };
    }, []);

    return (
        <div
            aria-live="polite"
            className="fixed bottom-4 right-4 z-40 rounded-full bg-white dark:bg-gray-800 px-3 py-1.5 text-xs shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300"
        >
            <span
                className={`mr-2 inline-block h-2 w-2 rounded-full transition-colors duration-300 ${online ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
            />
            <span className="text-gray-700 dark:text-gray-300">
                {online ? 'Online' : 'Offline'}
            </span>
        </div>
    );
}
