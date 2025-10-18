// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

// ✅ Tipizzazione chiara
interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
}

// ✅ Carica da variabili d’ambiente
const firebaseConfig = {
    apiKey: "AIzaSyCBl_I6wUQa5AXqfMYvfDybw4ihRafJ2Mc",
    authDomain: "buzzer-ccb45.firebaseapp.com",
    databaseURL: "https://buzzer-ccb45-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "buzzer-ccb45",
    storageBucket: "buzzer-ccb45.appspot.com", // ⚠️ corretto (non firebasestorage.app)
    messagingSenderId: "182770002519",
    appId: "1:182770002519:web:4877f622aeaeab8baed112",
    measurementId: "G-M665T8050G",
};
// ✅ Evita doppie inizializzazioni (Next.js SSR safe)
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Esporta il database
export const db: Database = getDatabase(app);
