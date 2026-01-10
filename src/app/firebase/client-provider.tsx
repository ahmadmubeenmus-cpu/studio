"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from ".";
import { FirebaseProvider } from "./provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/shared/logo";

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage =
      pathname.startsWith("/login") || pathname.startsWith("/signup");

    if (!user && !isAuthPage) {
      router.replace("/login");
    }
    if (user && (isAuthPage || pathname === "/")) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
  
  // Show a loading screen while we determine auth state, to prevent flashing
  if (isLoading || (!user && !isAuthRoute) || (user && (isAuthRoute || pathname === '/'))) {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Logo/>
            <div className="mt-4 flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full animate-spin" />
              <p className="text-muted-foreground">Connecting...</p>
            </div>
        </div>
       </div>
    );
  }

  return <FirebaseProvider>{children}</FirebaseProvider>;
}
