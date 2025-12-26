'use client';

import React, { useEffect, useState } from 'react';

interface TimerProps {
    remainingMs: number;
    totalMs: number;
}

export function Timer({ remainingMs, totalMs }: TimerProps) {
    const [currentMs, setCurrentMs] = useState(remainingMs);

    useEffect(() => {
        setCurrentMs(remainingMs);
    }, [remainingMs]);

    useEffect(() => {
        if (currentMs <= 0) return;

        const interval = setInterval(() => {
            setCurrentMs((prev) => Math.max(0, prev - 10));
        }, 10);

        return () => clearInterval(interval);
    }, [currentMs]);

    const ratio = Math.max(Math.min(currentMs / totalMs, 1), 0);
    const seconds = Math.floor(currentMs / 1000);
    const milliseconds = Math.floor((currentMs % 1000) / 10);

    // Rosso se <= 3 secondi
    const isLowTime = currentMs <= 3000;
    const strokeColor = isLowTime ? '#dc2626' : '#2563eb';
    const textColor = isLowTime ? 'text-red-600' : 'text-gray-900';

    return (
        <div className="flex flex-col items-center">
            <div className="relative h-20 w-20">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="#e5e7eb"
                        strokeWidth="10"
                        fill="none"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke={strokeColor}
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 45}
                        strokeDashoffset={(1 - ratio) * 2 * Math.PI * 45}
                        strokeLinecap="round"
                        className="transition-all duration-100"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-semibold font-mono ${textColor}`}>
                        {seconds}
                        <span className="text-sm opacity-70">
                            .{milliseconds.toString().padStart(2, '0')}
                        </span>
                    </span>
                </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Tempo rimanente</p>
        </div>
    );
}