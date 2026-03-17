import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set persistence to session (clears on tab/window close)
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("Persistence error:", error);
});

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
