import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default config or read from env if available (Netlify)
// For now, we will try to read from window if injected, or env, or a placeholder.
// Note: In a real Netlify deployment, you'd use import.meta.env.VITE_FIREBASE_API_KEY etc.
// But based on the existing code, it was injected as JSON.parse(__firebase_config).

let firebaseConfig: any = {
    apiKey: "dummy-api-key",
    authDomain: "dummy.firebaseapp.com",
    projectId: "dummy-project"
};

// Try to get from global variable (legacy/existing)
if (typeof (window as any).__firebase_config !== 'undefined') {
  firebaseConfig = JSON.parse((window as any).__firebase_config);
} else {
  // Placeholder - User needs to provide this via Env vars or fill it in.
  // We'll look for VITE_FIREBASE_CONFIG env var which could be a JSON string
  const envConfig = import.meta.env.VITE_FIREBASE_CONFIG;
  if (envConfig) {
      try {
          firebaseConfig = JSON.parse(envConfig);
      } catch (e) {
          console.error("Failed to parse VITE_FIREBASE_CONFIG", e);
      }
  } else {
      // Fallback or empty (will cause errors if not configured)
      console.warn("No Firebase Config found! Please configure VITE_FIREBASE_CONFIG in .env or inject __firebase_config.");
  }
}

// Ensure we have at least a dummy config to prevent initialization errors during dev/preview if env is missing
if (!firebaseConfig.apiKey) {
    firebaseConfig = {
        apiKey: "dummy-api-key",
        authDomain: "dummy.firebaseapp.com",
        projectId: "dummy-project"
    };
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = (typeof (window as any).__app_id !== 'undefined') ? (window as any).__app_id : 'xfive-battle';
