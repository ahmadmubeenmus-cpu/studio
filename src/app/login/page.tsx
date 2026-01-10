"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { LoginForm } from "@/components/auth/login-form";
import { LoadingScreen } from '@/components/shared/loading-screen';

export default function LoginPage() {
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
      title="Welcome Back"
      description="Enter your credentials to access your dashboard."
    >
      <LoginForm />
    </AuthFormWrapper>
  );
}
