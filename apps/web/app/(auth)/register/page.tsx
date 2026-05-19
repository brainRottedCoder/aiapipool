"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { RegisterForm } from "@/components/auth/register-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile py-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="font-sans text-headline-xl mt-6">Create your account</h1>
          <p className="font-sans text-body-md text-on-surface-variant mt-2">Get started with SAPI in seconds</p>
        </div>

        <div className="space-y-4">
          <OAuthButtons />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-subtle" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 font-mono text-label-sm text-on-surface-variant">or register with email</span>
            </div>
          </div>

          <RegisterForm />
        </div>

        <p className="text-center font-sans text-body-md text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
