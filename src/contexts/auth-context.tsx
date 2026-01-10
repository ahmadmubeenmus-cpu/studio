"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Mock session persistence
    const storedUser = localStorage.getItem("remoteDroidUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    // Mock login logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = { uid: "user-1", email };
    setUser(mockUser);
    localStorage.setItem("remoteDroidUser", JSON.stringify(mockUser));
    setLoading(false);
    router.push("/dashboard");
  };
  
  const googleLogin = async () => {
    setLoading(true);
    // Mock login logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = { uid: "user-1", email: "user@google.com" };
    setUser(mockUser);
    localStorage.setItem("remoteDroidUser", JSON.stringify(mockUser));
    setLoading(false);
    router.push("/dashboard");
  };

  const signup = async (email: string, pass: string) => {
    setLoading(true);
    // Mock signup logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = { uid: "user-1", email };
    setUser(mockUser);
    localStorage.setItem("remoteDroidUser", JSON.stringify(mockUser));
    setLoading(false);
    router.push("/dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("remoteDroidUser");
    router.push("/login");
  };

  const value = { user, loading, login, googleLogin, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
