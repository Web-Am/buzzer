"use client";

import Header from '@/app/components/shared/Header';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function useRecaptcha(siteKey?: string) {
    useEffect(() => {
        if (!siteKey) return;
        if (document.querySelector(`#recaptcha-script`)) return;
        const s = document.createElement('script');
        s.id = 'recaptcha-script';
        s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        s.async = true;
        document.head.appendChild(s);
    }, [siteKey]);
}

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<null | { ok: boolean; msg: string }>(null);

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    useRecaptcha(siteKey);

    const validate = () => {
        if (!name.trim() || !email.trim() || !message.trim()) return 'Compila tutti i campi.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Email non valida.';
        if (message.trim().length < 10) return 'Il messaggio deve contenere almeno 10 caratteri.';
        return null;
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const v = validate();
        if (v) {
            setError(v);
            return;
        }
        setStatus('sending');
        try {
            // get recaptcha token (v3)
            let token = '';
            if (siteKey && (window as any).grecaptcha) {
                token = await (window as any).grecaptcha.execute(siteKey, { action: 'contact' });
            }

            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim(), recaptchaToken: token }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Errore');
            setStatus('ok');
            setName(''); setEmail(''); setMessage('');
            setShowModal({ ok: true, msg: 'Messaggio inviato con successo. Grazie!' });
        } catch (err: any) {
            setStatus('error');
            const msg = err?.message || 'Invio fallito';
            setError(msg);
            setShowModal({ ok: false, msg });
        }
    };

    return <>
        <Header />
        <main className="max-w-3xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-2">Contattaci</h1>
                <p className="text-sm text-gray-500 mb-4">Hai bisogno di assistenza o vuoi suggerire una funzionalità? Scrivici qui.</p>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nome</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded" placeholder="Il tuo nome" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full p-3 border rounded" placeholder="tuo@email.com" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Messaggio</label>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full p-3 border rounded h-40" placeholder="Scrivi qui il tuo messaggio" />
                    </div>

                    {error && <div className="text-sm text-red-600">{error}</div>}

                    <div className="flex items-center gap-3">
                        <button disabled={status === 'sending'} type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white shadow">
                            {status === 'sending' ? 'Invio...' : 'Invia messaggio'}
                        </button>
                        {status === 'ok' && <div className="text-sm text-green-600">Messaggio inviato. Grazie!</div>}
                    </div>
                </form>
            </div>
        </main>

        {showModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center">
                <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowModal(null)} />
                <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-sm text-center">
                    <div className={`text-3xl mb-2 ${showModal.ok ? 'text-green-500' : 'text-red-500'}`}>{showModal.ok ? '✓' : '✕'}</div>
                    <div className="mb-4">{showModal.msg}</div>
                    <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => setShowModal(null)}>Chiudi</button>
                </div>
            </div>
        )}
    </>
}