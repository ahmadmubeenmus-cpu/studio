import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthFormWrapper
      title="Welcome Back"
      description="Enter your credentials to access your dashboard."
    >
      <LoginForm />
    </AuthFormWrapper>
  );
}
