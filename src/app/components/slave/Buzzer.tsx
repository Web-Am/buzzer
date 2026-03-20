'use client';

import { Button } from "../ui/Button";

interface BuzzerProps {
    disabled: boolean;
    label: string;
    onPress: () => void;
}

export function Buzzer({ disabled, label, onPress }: BuzzerProps) {
    return (
        <button
            className={`
                relative h-32 w-32 rounded-full text-3xl font-black shadow-2xl transform transition-all duration-200
                ${disabled
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-red-600 hover:bg-red-700 active:scale-95 hover:scale-105 text-white border-4 border-red-800'
                }
                flex items-center justify-center
                before:absolute before:inset-0 before:rounded-full before:bg-red-500 before:opacity-0 before:transition-opacity before:duration-200
                hover:before:opacity-20
                after:absolute after:inset-2 after:rounded-full after:border-2 after:border-white after:opacity-0 after:transition-opacity after:duration-200
                hover:after:opacity-100
            `}
            disabled={disabled}
            onClick={onPress}
        >
            <span className="relative z-10 drop-shadow-lg">
                {label}
            </span>
            {/* Effetto luce */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-red-800 opacity-0 hover:opacity-30 transition-opacity duration-200"></div>
        </button>
    );
}
