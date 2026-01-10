"use client";

import { createContext, useContext, ReactNode } from "react";
import { initializeFirebase } from "./config";
import { Auth } from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import { Firestore } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

interface FirebaseContextType {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, auth, firestore } = initializeFirebase();

  // This provider's sole responsibility is to provide the Firebase instances
  // to the rest of the application. The routing logic has been moved to the
  // relevant layouts to prevent race conditions.
  return (
    <FirebaseContext.Provider value={{ app, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

export const useUser = () => {
    const { auth } = initializeFirebase();
    const [user, isLoading, error] = useAuthState(auth);
    return { user, isLoading, error };
}