'use client';
import clsx from 'clsx';
import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    isLoading?: boolean;
}

const base =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 active:scale-[0.98]';

const variants: Record<Variant, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-500 shadow-md shadow-primary-600/25 hover:shadow-lg hover:shadow-primary-600/30',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-500 shadow-md shadow-secondary-600/25 hover:shadow-lg hover:shadow-secondary-600/30',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
};

const sizes: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
};

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            className={clsx(base, variants[variant], sizes[size], className)}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {children}
        </button>
    );
}
