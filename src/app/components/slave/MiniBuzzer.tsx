'use client';

import { Button } from "../ui/Button";


interface MiniBuzzerProps {
    bonus: number;
    disabled: boolean;
    cost: number;
    onPress: () => void;
}

export function MiniBuzzer({ bonus, disabled, cost, onPress }: MiniBuzzerProps) {
    return (
        <Button
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={onPress}
            className="flex flex-col text-xs"
        >
            +{bonus} <span className="text-[10px]">({cost} pt)</span>
        </Button>
    );
}
