"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/firebase";
import { FirebaseProvider } from "./provider";
import { LoadingScreen } from "@/components/shared/loading-screen";

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return; // Wait until user status is resolved

    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
    
    // If user is not logged in and not on an auth page, redirect to login
    if (!user && !isAuthPage) {
      router.replace("/login");
    } 
    // If user is logged in and on an auth page or the root, redirect to dashboard
    else if (user && (isAuthPage || pathname === "/")) {
      router.replace("/dashboard");
    }

  }, [user, isLoading, pathname, router]);

  // To prevent content flashing, we determine if we should show a loading screen.
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const shouldShowLoading = isLoading || (!user && !isAuthPage) || (user && (isAuthPage || pathname === "/"));

  if (shouldShowLoading) {
      return <LoadingScreen />;
  }

  return <FirebaseProvider>{children}</FirebaseProvider>;
}
