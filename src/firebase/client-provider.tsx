"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from ".";
import { FirebaseProvider } from "./provider";

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
      router.push("/login");
    }
    if (user && isAuthPage) {
      router.push("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  return <FirebaseProvider>{children}</FirebaseProvider>;
}
