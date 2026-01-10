
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "remote-droid-e96ba.firebaseapp.com",
  projectId: "remote-droid-e96ba",
  storageBucket: "remote-droid-e96ba.appspot.com",
  messagingSenderId: "951814716323",
  appId: "1:951814716323:web:9643d526a8825f38a5b9c5",
  measurementId: "G-R9VRLV1N5W"
};

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

let firebaseInstances: FirebaseInstances | null = null;

export const initializeFirebase = (): FirebaseInstances => {
  if (firebaseInstances) {
    return firebaseInstances;
  }

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  firebaseInstances = { app, auth, firestore };
  return firebaseInstances;
};
