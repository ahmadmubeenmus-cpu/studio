"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";
import { usePathname, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    setApp(app);
    setAuth(auth);
    setFirestore(firestore);
  }, []);

  const [user, loading] = useAuthState(getAuth());

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");

    if (!user && !isAuthPage) {
      router.push("/login");
    }
    if (user && isAuthPage) {
      router.push("/dashboard");
    }
  }, [user, loading, pathname, router]);

  const value = { app, auth, firestore };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
}
