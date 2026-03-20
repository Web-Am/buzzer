'use client';

import { Button } from "../ui/Button";


interface MiniBuzzerProps {
    bonus: number;
    disabled: boolean;
    cost: number;
    onPress: () => void;
}

export function MiniBuzzer({ bonus, disabled, cost, onPress }: MiniBuzzerProps) {
    const getColorClasses = () => {
        if (disabled) return 'bg-gray-400 border-gray-500';
        switch (bonus) {
            case 5: return 'bg-orange-500 hover:bg-orange-600 border-orange-700';
            case 10: return 'bg-purple-500 hover:bg-purple-600 border-purple-700';
            case 20: return 'bg-pink-500 hover:bg-pink-600 border-pink-700';
            default: return 'bg-blue-500 hover:bg-blue-600 border-blue-700';
        }
    };

    return (
        <button
            className={`
                relative h-20 w-20 rounded-full text-sm font-bold shadow-lg transform transition-all duration-200
                ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 active:scale-95'}
                border-2 text-white flex flex-col items-center justify-center gap-0.5
                ${getColorClasses()}
            `}
            disabled={disabled}
            onClick={onPress}
        >
            <span className="text-xs font-black">+{bonus}</span>
            <span className="text-[9px] opacity-90">({cost})</span>
        </button>
    );
}
