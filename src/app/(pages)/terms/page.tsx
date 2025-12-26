import Link from 'next/link';

export default function TermsPage() {
    return (
        <main className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4">Termini e Condizioni</h1>

            <p className="mb-4">I presenti Termini e Condizioni regolano l'uso del servizio FantaBuzzer.</p>

            <h2 className="text-xl font-semibold mt-6">Accettazione</h2>
            <p className="mt-2">Utilizzando l'app, l'utente accetta questi termini. Se non si accettano, non utilizzare il servizio.</p>

            <h2 className="text-xl font-semibold mt-6">Uso del servizio</h2>
            <p className="mt-2">Il servizio permette di creare sessioni di gioco, invitare partecipanti tramite codice e gestire votazioni e punteggi. L'utente è responsabile dei contenuti inseriti e di rispettare la legge e il diritto di terzi.</p>

            <h2 className="text-xl font-semibold mt-6">Limitazioni e responsabilità</h2>
            <p className="mt-2">FantaBuzzer fornisce il servizio "così com'è" e non si assume responsabilità per interruzioni, perdita di dati o danni indiretti. L'utente utilizza il servizio a proprio rischio.</p>

            <h2 className="text-xl font-semibold mt-6">Modifiche al servizio</h2>
            <p className="mt-2">Ci riserviamo il diritto di modificare, sospendere o interrompere il servizio o parti di esso. Eventuali modifiche ai termini saranno comunicate nell'app o tramite email quando possibile.</p>

            <h2 className="text-xl font-semibold mt-6">Legge applicabile</h2>
            <p className="mt-2">I presenti termini sono regolati dalla legge italiana. Per controversie si applicheranno le norme vigenti.</p>

            <div className="mt-8">
                <Link href="/" className="text-indigo-600 hover:underline">Torna alla home</Link>
            </div>
        </main>
    );
}
