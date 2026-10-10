const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DEFAULT_DATABASE_URL = 'https://buzzer-ccb45-default-rtdb.europe-west1.firebasedatabase.app';

function loadDatabaseUrl() {
    const normalize = (value) => {
        if (!value) return null;
        const trimmed = value.replace(/['"]/g, '').trim().replace(/\/$/, '');
        return trimmed || null;
    };

    const fromEnv = normalize(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
    if (fromEnv) return fromEnv;

    try {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
                const match = line.match(/^\s*NEXT_PUBLIC_FIREBASE_DATABASE_URL\s*=\s*(.*)\s*$/);
                if (match) {
                    const fromFile = normalize(match[1]);
                    if (fromFile) return fromFile;
                    break;
                }
            }
        }
    } catch (err) {
        console.error('Impossibile leggere .env.local:', err.message);
    }
    return DEFAULT_DATABASE_URL;
}

function parseArgs(argv) {
    return {
        dryRun: argv.includes('--dry-run'),
        yes: argv.includes('--yes'),
    };
}

async function confirm(message) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(`${message} (y/n): `, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === 'y');
        });
    });
}

function isGhost(p) {
    if (!p || typeof p !== 'object') return true;
    return p.name == null && p.pointsTotal == null;
}

async function main() {
    const { dryRun, yes } = parseArgs(process.argv.slice(2));
    const databaseUrl = loadDatabaseUrl();

    console.log(`Database: ${databaseUrl}`);
    console.log(`Modalità: ${dryRun ? 'DRY-RUN (nessuna scrittura)' : 'SCRITTURA'}`);

    const getRes = await fetch(`${databaseUrl}/rooms.json`);
    if (!getRes.ok) {
        throw new Error(`GET /rooms.json fallito: ${getRes.status} ${getRes.statusText}`);
    }

    const rooms = await getRes.json();
    if (!rooms) {
        console.log('Nessuna stanza trovata.');
        return;
    }

    const updates = {};
    let total = 0;

    for (const [code, room] of Object.entries(rooms)) {
        const participants = room && typeof room === 'object' ? room.participants : null;
        if (!participants || typeof participants !== 'object') continue;

        for (const key of Object.keys(participants)) {
            const p = participants[key];
            if (isGhost(p)) {
                updates[`rooms/${code}/participants/${key}`] = null;
                total++;
                console.log(`  - Stanza ${code}: rimuovo partecipante fantasma '${key}'`);
            }
        }
    }

    if (total === 0) {
        console.log('Nessun partecipante fantasma trovato: nessuna modifica necessaria.');
        return;
    }

    console.log(`Trovati ${total} partecipanti fantasma (verranno eliminati).`);

    if (dryRun) {
        console.log('DRY-RUN: nessuna scrittura eseguita.');
        return;
    }

    if (!yes) {
        const ok = await confirm(`Procedere con l'eliminazione di ${total} partecipanti?`);
        if (!ok) {
            console.log('Operazione annullata.');
            return;
        }
    }

    const patchRes = await fetch(`${databaseUrl}/.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });

    if (!patchRes.ok) {
        const body = await patchRes.text();
        throw new Error(`PATCH fallito: ${patchRes.status} ${body}`);
    }

    console.log(`OK: ${total} partecipanti fantasma eliminati.`);
}

main().catch((err) => {
    console.error('Errore:', err.message);
    process.exit(1);
});
