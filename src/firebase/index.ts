import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { firebaseConfig } from './config';

function initializeFirebase() {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
}

initializeFirebase();

const app = getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

export function useUser() {
    const [user, isLoading, error] = useAuthState(auth);
    return { user, isLoading, error };
}

export { app, auth, firestore, initializeFirebase };
