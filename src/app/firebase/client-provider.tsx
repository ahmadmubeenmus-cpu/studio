"use client";

import { usePathname } from "next/navigation";
import { useUser } from ".";
import { FirebaseProvider } from "./provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/shared/logo";
import LoginPage from "@/app/login/page";
import DashboardLayout from "@/app/dashboard/layout";
import { DeviceList } from "@/app/dashboard/(components)/device-list";
import DashboardPage from "@/app/dashboard/page";

function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <div className="mt-4 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full animate-spin" />
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
  const pathname = usePathname();

  const isAuthPage =
      pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isLoading) {
    return <LoadingScreen />;
  }

  // If there's no user and we're not on an auth page, render the login page.
  if (!user && !isAuthPage) {
    return (
       <FirebaseProvider>
          <LoginPage />
       </FirebaseProvider>
    );
  }

  // If there is a user and we are on an auth page or the root, render the dashboard.
  if (user && (isAuthPage || pathname === "/")) {
      return (
        <FirebaseProvider>
            <DashboardPage />
        </FirebaseProvider>
      );
  }

  // If none of the above, render the requested children (for existing user on a valid page)
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
