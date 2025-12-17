import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Types for Firebase config
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

// Singleton instances
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let configPromise: Promise<FirebaseConfig> | null = null;
let initPromise: Promise<void> | null = null;

// Fetch Firebase config from the serverless function (cached)
async function fetchFirebaseConfig(): Promise<FirebaseConfig> {
  if (!configPromise) {
    configPromise = fetch('/api/firebase-config')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch Firebase config');
        }
        return response.json();
      })
      .catch((error) => {
        configPromise = null; // Reset on error so retry is possible
        throw error;
      });
  }
  return configPromise;
}

// Initialize Firebase (lazy, singleton)
async function initializeFirebase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const firebaseConfig = await fetchFirebaseConfig();
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    })();
  }
  return initPromise;
}

// Getters that ensure Firebase is initialized
export async function getFirebaseApp(): Promise<FirebaseApp> {
  await initializeFirebase();
  return app!;
}

export async function getFirebaseAuth(): Promise<Auth> {
  await initializeFirebase();
  return auth!;
}

export async function getFirebaseDb(): Promise<Firestore> {
  await initializeFirebase();
  return db!;
}

// App ID (synchronous, doesn't depend on Firebase config)
export const appId = (typeof (window as any).__app_id !== 'undefined') ? (window as any).__app_id : 'xfive-battle';
