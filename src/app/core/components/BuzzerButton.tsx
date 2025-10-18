// src/components/BuzzerButton.tsx
import React, { useState } from "react";

type Props = {
    disabled?: boolean;
    onClick: () => Promise<void> | void;
    label?: string;
};

const BuzzerButton: React.FC<Props> = ({ disabled = false, onClick, label = "BUZZ" }) => {
    const [active, setActive] = useState(false);

    const handle = async () => {
        if (disabled) return;
        setActive(true);
        try {
            await onClick();
        } catch (err) {
            console.error("Errore onClick buzzer", err);
        } finally {
            setTimeout(() => setActive(false), 200);
        }
    };

    return (
        <button
            aria-label="Buzzer"
            onClick={handle}
            disabled={disabled}
            className={`flex items-center justify-center rounded-full shadow-xl active:scale-95
        ${disabled ? "bg-gray-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} 
        w-40 h-40 sm:w-56 sm:h-56 text-white text-2xl font-bold transition-transform`}
        >
            <div className={`${active ? "scale-95" : "scale-100"} transition-transform`}>{label}</div>
        </button>
    );
};

export default BuzzerButton;
