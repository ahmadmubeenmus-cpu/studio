"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from ".";
import { FirebaseProvider } from "./provider";
import { Skeleton } from "@/components/ui/skeleton";

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

  if (isLoading || (!user && !isAuthRoute) || (user && (isAuthRoute || pathname === '/'))) {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
       </div>
    );
  }

  return <FirebaseProvider>{children}</FirebaseProvider>;
}
