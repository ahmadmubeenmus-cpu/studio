"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/firebase";
import { FirebaseProvider } from "./provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/shared/logo";

function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <div className="mt-4 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
          <p className="text-muted-foreground">Connecting...</p>
        </div>
      </div>
    </div>
  );
}


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
    const isDashboard = pathname.startsWith("/dashboard");

    if (!user && !isAuthPage) {
      router.replace("/login");
    } else if (user && (isAuthPage || pathname === "/")) {
      router.replace("/dashboard");
    }

  }, [user, isLoading, pathname, router]);

  // While loading, or if we are about to redirect, show a loading screen
  // to prevent flickering of incorrect pages.
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  if (isLoading || (!user && !isAuthPage) || (user && (isAuthPage || pathname === "/"))) {
      return <LoadingScreen />;
  }

  return <FirebaseProvider>{children}</FirebaseProvider>;
}
