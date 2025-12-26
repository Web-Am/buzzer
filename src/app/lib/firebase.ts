'use client';

import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';

/**
 * Configurazione (usa variabili d'ambiente se presenti)
 * Puoi sovrascrivere le variabili NEXT_PUBLIC_* nel .env.local
 */
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCBl_I6wUQa5AXqfMYvfDyb4ihRafJ2Mc",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "buzzer-ccb45.firebaseapp.com",
    databaseURL:
        process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
        "https://buzzer-ccb45-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "buzzer-ccb45",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "buzzer-ccb45.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "182770002519",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:182770002519:web:4877f622aeaeab8baed112",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-M665T8050G",
};

let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

export const db = getDatabase(app);