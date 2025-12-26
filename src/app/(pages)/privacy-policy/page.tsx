import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return <>
        <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 p-2">
                                <Zap size={24} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                Fanta Buzzer
                            </h1>
                        </div>
                    </Link>
                </div>
            </div>
        </header>
        <main className="max-w-4xl mx-auto p-8">

            <h1 className="text-3xl font-bold mb-4">Informativa sulla Privacy</h1>

            <p className="mb-4">La presente Informativa descrive le modalità di raccolta e di utilizzo dei dati degli utenti da parte di FantaBuzzer.</p>

            <h2 className="text-xl font-semibold mt-6">Dati raccolti</h2>
            <ul className="list-disc ml-6 mt-2">
                <li>Informazioni di contatto: email e nome (fornite dall'utente durante la registrazione o partecipazione).</li>
                <li>Dati di sessione: codice sessione, identificativi dei partecipanti e punteggi temporanei necessari per il funzionamento della partita.</li>
                <li>Dati tecnici: informazioni di log, come orario di accesso e azioni eseguite nell'app (salvate per motivi di debug e funzionamento).</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">Finalità del trattamento</h2>
            <p className="mt-2">I dati raccolti sono utilizzati esclusivamente per fornire e migliorare il servizio FantaBuzzer, in particolare per:</p>
            <ul className="list-disc ml-6 mt-2">
                <li>Creare e gestire sessioni e partecipanti.</li>
                <li>Memorizzare punteggi temporanei e storico delle sessioni.</li>
                <li>Analisi interna per migliorare l'esperienza (anonima e aggregata).</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">Conservazione</h2>
            <p className="mt-2">I dati vengono conservati per il tempo necessario al fine descritto o fino a quando l'utente richieda la cancellazione. Alcuni dati tecnici possono essere conservati più a lungo per motivi di sicurezza e audit.</p>

            <h2 className="text-xl font-semibold mt-6">Condivisione con terze parti</h2>
            <p className="mt-2">I dati non saranno venduti né condivisi con terze parti per scopi di marketing. Potremmo utilizzare servizi di terze parti (es. Firebase) che operano come sub‑processori per l'hosting e la gestione del database: tali fornitori sono soggetti a obblighi contrattuali di riservatezza e sicurezza.</p>

            <h2 className="text-xl font-semibold mt-6">Diritti dell'utente</h2>
            <p className="mt-2">L'utente può richiedere l'accesso, la rettifica o la cancellazione dei propri dati scrivendo all'indirizzo email di contatto indicato nell'app. Potrebbe essere necessario fornire un'identificativo per verificare la richiesta.</p>

            <h2 className="text-xl font-semibold mt-6">Contatti</h2>
            <p className="mt-2">Per domande relative alla privacy contatta: <strong>privacy@fantabuzzer.example</strong></p>

            <div className="mt-8">
                <Link href="/" className="text-indigo-600 hover:underline">Torna alla home</Link>
            </div>
        </main>
    </>
}
