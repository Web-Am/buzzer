import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={clsx(
                'rounded-2xl bg-white shadow-sm border border-gray-100 p-6',
                className
            )}
            {...props}
        />
    );
}
