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
    'inline-flex items-center justify-center rounded-xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-800'
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
