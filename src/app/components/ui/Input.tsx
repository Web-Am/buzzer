'use client';

import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                className={clsx(
                    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition',
                    'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
