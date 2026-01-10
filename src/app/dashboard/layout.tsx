"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/shared/header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
