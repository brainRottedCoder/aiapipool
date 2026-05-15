"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile py-24">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-sans text-headline-xl">Check your email</h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          We sent a verification link to your email address. Click the link to verify your account.
        </p>
        <Link href="/login">
          <Button variant="secondary">Back to sign in</Button>
        </Link>
      </div>
    </div>
  );
}
