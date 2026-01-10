"use client";

import Header from "@/components/shared/header";
import { useUser } from "@/app/firebase/client-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-card">
          <div className="container flex h-16 items-center">
            <Skeleton className="h-8 w-36" />
            <div className="flex flex-1 items-center justify-end space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
            <Skeleton className="h-8 w-48 mb-6"/>
            <div className="space-y-4">
                <Skeleton className="h-24 w-full"/>
                <Skeleton className="h-24 w-full"/>
            </div>
        </main>
      </div>
    );
  }
  
  if (error) {
    // Handle error state, maybe show an error message
    return <div>Error loading user.</div>
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
