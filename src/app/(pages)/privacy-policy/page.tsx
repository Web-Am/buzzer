import Header from '@/app/components/shared/Header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    const lastUpdate = '15 giugno 2025';

    return (
        <>
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-10 sm:px-8">
                <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 mb-6 transition-colors">
                    <ArrowLeft size={16} />
                    Torna alla home
                </Link>

                <h1 className="text-3xl font-bold mb-1">Informativa sulla Privacy</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Ultimo aggiornamento: {lastUpdate}</p>

                <div className="space-y-8 leading-relaxed text-gray-800 dark:text-gray-200">

                    <section>
                        <h2 className="text-xl font-semibold mb-2">1. Titolare del trattamento</h2>
                        <p>
                            Fanta Buzzer è un'applicazione web. Il Titolare del trattamento
                            dei dati personali raccolti tramite l'applicazione è contattabile
                            tramite la pagina{' '}
                            <Link href="/contact" className="text-primary-600 hover:underline">Contatti</Link>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">2. Dati personali raccolti</h2>
                        <p>Durante l'utilizzo di Fanta Buzzer, raccogliamo le seguenti categorie di dati:</p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li>
                                <strong>Dati identificativi e di contatto:</strong> nome e indirizzo email, forniti
                                volontariamente dall'utente al momento della creazione di una stanza o della
                                partecipazione a una partita.
                            </li>
                            <li>
                                <strong>Dati di gioco:</strong> cronologia delle partite (punteggi assegnati, round
                                vinti, domande, data e ora delle giocate), stato di connessione (online/offline),
                                codice stanza.
                            </li>
                            <li>
                                <strong>Dati di navigazione tecnici:</strong> indirizzo IP (temporaneamente nei log
                                del server Vercel e di Firebase), tipo di browser, sistema operativo, pagine visitate
                                all'interno dell'app.
                            </li>
                            <li>
                                <strong>Dati memorizzati localmente:</strong> preferenza tema (chiaro/scuro) ed
                                email dell'utente per ogni stanza, salvati esclusivamente nel{' '}
                                <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">localStorage</code>{' '}
                                del browser. Questi dati non vengono trasmessi a terzi separatamente dal
                                funzionamento dell'app.
                            </li>
                            <li>
                                <strong>Dati del form contatti:</strong> nome, email e messaggio, inviati
                                volontariamente tramite la pagina contatti. Questi dati sono protetti da Google
                                reCAPTCHA v3 per prevenire spam automatizzato. L'utilizzo di reCAPTCHA è soggetto anche alla{' '}
                                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Privacy Policy</a>
                                {' '}e ai{' '}
                                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Termini di Servizio</a>
                                {' '}di Google.
                            </li>
                        </ul>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <strong>Nota:</strong> Fanta Buzzer <em>non</em> raccoglie dati biometrici, dati
                            sanitari, né dati relativi a condanne penali. L'applicazione non è destinata a utenti
                            di età inferiore a 14 anni e il Titolare non raccoglie consapevolmente dati personali
                            di minori di 14 anni.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">3. Finalità e base giuridica del trattamento</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse mt-2">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left font-medium">Finalità</th>
                                        <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left font-medium">Base giuridica</th>
                                        <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left font-medium">Dati utilizzati</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2">Creazione e gestione delle stanze di gioco</td>
                                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2">Esecuzione di un contratto (art. 6.1.b GDPR)</td>
                                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2">Nome, email, dati di gioco</td>
                                    </tr>
                                    <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2">Memorizzazione delle preferenze dell'interfaccia (tema chiaro/scuro)</td>
                                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2">Legittimo interesse (art. 6.1.f GDPR)</td>
                                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2">Preferenza tema (localStorage)</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2">Analisi statistica aggregata dell'utilizzo (Vercel Analytics)</td>
                                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2">Legittimo interesse (art. 6.1.f GDPR)</td>
                                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2">Dati di navigazione aggregati</td>
                                    </tr>
                                    <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2">Risposta alle richieste inviate tramite il form contatti</td>
                                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2">Esecuzione di un contratto / obbligo legale (art. 6.1.b/c GDPR)</td>
                                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2">Nome, email, messaggio</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">4. Modalità del trattamento e conservazione</h2>
                        <p>
                            I dati sono trattati con strumenti informatici e telematici, adottando misure di sicurezza
                            adeguate a prevenire accessi non autorizzati, diffusione, modifica o distruzione non
                            autorizzata dei dati.
                        </p>
                        <p className="mt-2">
                            I dati di gioco (nome, email, punteggi, round) vengono conservati per l'intera durata
                            della stanza. I dati vengono rimossi dai sistemi attivi dell'applicazione al momento
                            dell'eliminazione della stanza da parte del Master; eventuali copie temporanee o backup
                            possono permanere per il tempo tecnico strettamente necessario.
                            Le email e i messaggi inviati tramite il form contatti sono conservati
                            per il tempo necessario a evadere la richiesta e comunque non oltre 12 mesi.
                        </p>
                        <p className="mt-2">
                            Il dato della preferenza tema salvato nel <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">localStorage</code>{' '}
                            rimane memorizzato nel browser dell'utente fino alla sua rimozione manuale tramite le
                            impostazioni del browser o la disattivazione del tema scuro dall'app.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">5. Comunicazione dei dati a terzi</h2>
                        <p>
                            I dati personali non vengono venduti, ceduti o comunicati a terzi per finalità di marketing.
                            L'app si avvale tuttavia dei seguenti fornitori di servizi che agiscono come Responsabili
                            del trattamento (art. 28 GDPR):
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-2">
                            <li>
                                <strong>Google LLC (Firebase Realtime Database)</strong> — per l'archiviazione e la
                                sincronizzazione in tempo reale dei dati di gioco. I dati sono ospitati su server
                                situati in Europa (europe-west1, Belgio).{' '}
                                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                    Privacy Policy di Google
                                </a>
                            </li>
                            <li>
                                <strong>Vercel Inc.</strong> — per l'hosting dell'applicazione web e l'analytics
                                anonimo. I log del server possono contenere indirizzi IP temporanei.{' '}
                                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                    Privacy Policy di Vercel
                                </a>
                            </li>
                            <li>
                                <strong>Twilio Inc. (SendGrid)</strong> — per l'invio delle email inviate tramite
                                il form contatti.{' '}
                                <a href="https://www.twilio.com/en-us/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                    Privacy Policy di Twilio
                                </a>
                            </li>
                            <li>
                                <strong>Google LLC (reCAPTCHA)</strong> — per la protezione del form contatti dallo
                                spam. Il servizio analizza il comportamento di navigazione per determinare se
                                l'utente è umano.{' '}
                                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                    Privacy Policy di Google
                                </a>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">6. Trasferimenti dei dati extra-UE</h2>
                        <p>
                            I dati trattati da Firebase (Google) risiedono su server situati in Belgio (europe-west1),
                            all'interno dello Spazio Economico Europeo. I log di Vercel e il servizio SendGrid
                            possono comportare trasferimenti verso gli Stati Uniti; tali trasferimenti sono
                            effettuati nel rispetto delle Clausole Contrattuali Standard (SCC) approvate dalla
                            Commissione Europea, che garantiscono un livello di protezione adeguato ai sensi
                            dell'art. 46 GDPR.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">7. Diritti dell'interessato</h2>
                        <p>
                            In qualità di interessato, hai diritto di ottenere dal Titolare, nei casi previsti
                            dal GDPR:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>Accesso</strong> (art. 15): sapere se i tuoi dati sono in nostro possesso e riceverne copia.</li>
                            <li><strong>Rettifica</strong> (art. 16): correggere dati inesatti o incompleti.</li>
                            <li><strong>Cancellazione</strong> (art. 17, "diritto all'oblio"): ottenere la cancellazione dei tuoi dati.</li>
                            <li><strong>Limitazione</strong> (art. 18): limitare temporaneamente il trattamento.</li>
                            <li><strong>Portabilità</strong> (art. 20): ricevere i dati in formato strutturato e trasferirli a un altro titolare.</li>
                            <li><strong>Opposizione</strong> (art. 21): opporti al trattamento basato su legittimo interesse (es. analytics).</li>
                        </ul>
                        <p className="mt-3">
                            Per esercitare i tuoi diritti, puoi contattarci tramite la pagina{' '}
                            <Link href="/contact" className="text-primary-600 hover:underline">Contatti</Link>
                            . Potrebbero essere richieste informazioni aggiuntive necessarie a verificare
                            l'identità del richiedente. Risponderemo entro 30 giorni.
                        </p>
                        <p className="mt-2">
                            Hai inoltre il diritto di proporre un reclamo all'Autorità Garante per la Protezione
                            dei Dati Personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">www.garanteprivacy.it</a>)
                            se ritieni che il trattamento dei tuoi dati violi il GDPR.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">8. Cookie e tecnologie similari</h2>
                        <p>
                            Fanta Buzzer non utilizza cookie di profilazione o tracciamento. Utilizza esclusivamente
                            il <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">localStorage</code> del browser per:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li>Memorizzare la preferenza tema (chiaro/scuro) scelta dall'utente.</li>
                            <li>Ricordare l'email inserita per ogni stanza, per comodità di accesso.</li>
                        </ul>
                        <p className="mt-2">
                            Questi dati non vengono utilizzati per finalità di profilazione, pubblicità o marketing.
                            Puoi cancellarli in qualsiasi momento dalle impostazioni del tuo browser.
                        </p>
                        <p className="mt-2">
                            Vercel Analytics raccoglie dati statistici aggregati (pagine viste, browser,
                            area geografica approssimativa) senza utilizzare cookie e senza identificare
                            l'utente. Puoi disabilitare questa raccolta utilizzando un blocker di analytics
                            o contattandoci per opporti al trattamento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">9. Misure di sicurezza</h2>
                        <p>
                            Adottiamo le seguenti misure tecniche e organizzative per proteggere i tuoi dati:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li>Crittografia dei dati in transito tramite protocollo HTTPS/TLS.</li>
                            <li>Accesso autenticato al database Firebase tramite regole di sicurezza configurate.</li>
                            <li>Separazione logica dei dati tra stanze (ogni stanza è accessibile solo tramite codice univoco).</li>
                            <li>reCAPTCHA v3 per proteggere il form contatti da abusi automatizzati.</li>
                            <li>Manutenzione e aggiornamento periodici della piattaforma con misure ragionevoli.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">10. Modifiche alla presente informativa</h2>
                        <p>
                            La presente Informativa può essere soggetta a modifiche periodiche. In caso di
                            modifiche sostanziali, gli utenti verranno informati tramite un avviso all'interno
                            dell'applicazione. La data dell'ultimo aggiornamento è riportata all'inizio del documento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">11. Contatti</h2>
                        <p>
                            Per esercitare i tuoi diritti, ricevere chiarimenti o segnalare un problema relativo
                            alla privacy, utilizza la pagina{' '}
                            <Link href="/contact" className="text-primary-600 hover:underline">Contatti</Link>
                            {' '}oppure scrivi all'indirizzo email del Titolare.
                        </p>
                        <p className="mt-2">
                            Puoi anche rivolgerti all'Autorità Garante per la Protezione dei Dati Personali:
                            <br />
                            <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                www.garanteprivacy.it
                            </a>
                        </p>
                    </section>

                </div>

                <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors">
                        <ArrowLeft size={16} />
                        Torna alla home
                    </Link>
                </div>
            </main>
        </>
    );
}
