import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Handling
let firebaseConfig: any = null;
export let isDemoMode = false;

// 1. Try global injection (Legacy)
if (typeof (window as any).__firebase_config !== 'undefined') {
  firebaseConfig = JSON.parse((window as any).__firebase_config);
}
// 2. Try Env Var (Modern/Netlify)
else if (import.meta.env.VITE_FIREBASE_CONFIG) {
  try {
    firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
  } catch (e) {
    console.error("Failed to parse VITE_FIREBASE_CONFIG");
  }
}

// 3. Fallback to Demo Mode if no valid config found
if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.warn("⚠️ No valid Firebase Config found. Entering DEMO MODE.");
  isDemoMode = true;

  // Dummy config to satisfy initialization (won't work for real calls)
  firebaseConfig = {
    apiKey: "demo-mode-key",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo-project"
  };
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = (typeof (window as any).__app_id !== 'undefined') ? (window as any).__app_id : 'xfive-battle';
