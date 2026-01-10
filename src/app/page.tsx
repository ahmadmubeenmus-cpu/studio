"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/firebase/client-provider';
import { LoadingScreen } from "@/components/shared/loading-screen";

export default function RootPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  // Render a loading screen while the redirect is happening
  return <LoadingScreen />;
}
