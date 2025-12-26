'use client';

import { Button } from "../ui/Button";

interface BuzzerProps {
    disabled: boolean;
    label: string;
    onPress: () => void;
}

export function Buzzer({ disabled, label, onPress }: BuzzerProps) {
    return (
        <Button
            size="lg"
            className="h-20 w-40 rounded-full text-2xl font-bold shadow-md"
            disabled={disabled}
            onClick={onPress}
        >
            {label}
        </Button>
    );
}
