import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={clsx(
                'rounded-2xl bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700/80 p-6',
                className
            )}
            {...props}
        />
    );
}
