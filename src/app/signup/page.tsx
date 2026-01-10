import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <AuthFormWrapper
      title="Create an Account"
      description="Get started with RemoteDroid by creating a new account."
    >
      <SignUpForm />
    </AuthFormWrapper>
  );
}
