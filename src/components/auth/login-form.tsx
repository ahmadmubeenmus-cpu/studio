"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/firebase/auth";
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function LoginForm() {
  const { signInWithEmail, signInWithGoogle, isPending } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        await signInWithEmail(values.email, values.password);
    } catch(e: any) {
        toast({
            variant: "destructive",
            title: "Authentication failed",
            description: e.message
        });
    }
  }

  async function handleGoogleLogin() {
    try {
        await signInWithGoogle();
    } catch(e: any) {
        toast({
            variant: "destructive",
            title: "Authentication failed",
            description: e.message
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending} style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          {isPending ? <Loader2 className="animate-spin" /> : "Log In"}
        </Button>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
        </div>

        <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : (
            <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.38 6.52C13.56 13.46 18.28 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.53-4.18 7.18-10.45 7.18-17.65z"/>
                <path fill="#FBBC05" d="M10.94 28.72c-.52-1.57-.82-3.24-.82-5.02s.3-3.45.82-5.02l-8.38-6.52C.93 15.14 0 19.39 0 23.7s.93 8.56 2.56 11.48l8.38-6.46z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-5.72 0-10.44-3.96-12.18-9.26l-8.38 6.52C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                Google
            </>
            )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
                Sign up
            </Link>
        </p>
      </form>
    </Form>
  );
}
