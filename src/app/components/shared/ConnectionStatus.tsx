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
        <div className="fixed bottom-4 right-4 rounded-full bg-white px-3 py-1 text-xs shadow border">
            <span
                className={`mr-2 inline-block h-2 w-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
            />
            {online ? 'Online' : 'Offline'}
        </div>
    );
}
