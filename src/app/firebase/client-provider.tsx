"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { initializeFirebase } from "./config";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { Auth, getAuth } from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";

interface FirebaseContextType {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, auth } = initializeFirebase();
  const [user, isLoading] = useAuthState(auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return; // Wait until user status is resolved

    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");

    if (!user && !isAuthPage) {
      router.replace("/login");
    } else if (user && (isAuthPage || pathname === "/")) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const shouldShowLoading = isLoading || (!user && !isAuthPage) || (user && (isAuthPage || pathname === "/"));

  if (shouldShowLoading) {
    return <LoadingScreen />;
  }

  return (
    <FirebaseContext.Provider value={initializeFirebase()}>
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
