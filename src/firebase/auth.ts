"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { useTransition } from "react";
import { useFirebase } from "@/app/firebase/client-provider";

export function useAuth() {
  const { auth } = useFirebase();
  const [isPending, startTransition] = useTransition();

  const createUserWithEmail = (email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          if (!auth) throw new Error("Firebase auth not initialized");
          await createUserWithEmailAndPassword(auth, email, pass);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const signInWithEmail = (email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          if (!auth) throw new Error("Firebase auth not initialized");
          await signInWithEmailAndPassword(auth, email, pass);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const signInWithGoogle = () => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          if (!auth) throw new Error("Firebase auth not initialized");
          const provider = new GoogleAuthProvider();
          await signInWithPopup(auth, provider);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const signOut = () => {
    return new Promise<void>((resolve, reject) => {
        startTransition(async () => {
            try {
                if (!auth) throw new Error("Firebase auth not initialized");
                await firebaseSignOut(auth);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
  };

  return {
    createUserWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    isPending,
  };
}
