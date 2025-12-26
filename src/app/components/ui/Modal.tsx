'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    {title && <h2 className="text-lg font-semibold">{title}</h2>}
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>
                <div className="mb-4">{children}</div>
                <div className="flex justify-end gap-2">
                    {footer || (
                        <Button variant="secondary" onClick={onClose}>
                            Chiudi
                        </Button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
