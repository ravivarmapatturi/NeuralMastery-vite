import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Real project config -- safe to embed client-side. Firebase's own docs are
// explicit about this: these values identify the project to Google's
// servers, they are not secrets, and they grant no access on their own.
// The actual security boundary is Firestore's security rules (see
// firestore.rules), enforced server-side regardless of what a client sends.
const firebaseConfig = {
  apiKey: 'AIzaSyAVT-WKPzeVvB5n24jzsTxNasV-tz-h7OU',
  authDomain: 'neuralmastery-4dc6b.firebaseapp.com',
  projectId: 'neuralmastery-4dc6b',
  storageBucket: 'neuralmastery-4dc6b.firebasestorage.app',
  messagingSenderId: '78041224350',
  appId: '1:78041224350:web:c1d24e752b5b8ef598178f',
  measurementId: 'G-PKEBF7474W',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

// Emulator connection is opt-in and dev-only (VITE_USE_FIREBASE_EMULATOR=true
// set only when running scripts/firebase-emulator tests) -- never runs in a
// production build (import.meta.env.DEV is statically false there, so this
// whole branch is dead-code-eliminated), and never runs in a normal `npm run
// dev` against the real project unless that env var is explicitly set.
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}
