import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyB51xi7MdSatNhwrpjvGaLdzki5W0CXvfM",
  authDomain: "xfive-battle-season.firebaseapp.com",
  projectId: "xfive-battle-season",
  storageBucket: "xfive-battle-season.firebasestorage.app",
  messagingSenderId: "476615984544",
  appId: "1:476615984544:web:ad164a340e0f72e3c590c5",
  measurementId: "G-PCSM43PS9E"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = (typeof (window as any).__app_id !== 'undefined') ? (window as any).__app_id : 'xfive-battle';
