"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/firebase/client-provider';
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { SignUpForm } from "@/components/auth/signup-form";
import { LoadingScreen } from '@/components/shared/loading-screen';

export default function SignUpPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return <LoadingScreen />;
  }

  return (
    <AuthFormWrapper
      title="Create an Account"
      description="Get started with RemoteDroid by creating a new account."
    >
      <SignUpForm />
    </AuthFormWrapper>
  );
}
