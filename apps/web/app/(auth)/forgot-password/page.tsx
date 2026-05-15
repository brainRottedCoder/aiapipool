"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/logo";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile py-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="font-sans text-headline-xl mt-6">Reset your password</h1>
          <p className="font-sans text-body-md text-on-surface-variant mt-2">
            Enter your email address and we&apos;ll send you a reset link.
          </p>
        </div>
        <form className="space-y-4">
          <div>
            <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Email</label>
            <Input type="email" placeholder="architect@company.com" className="w-full" />
          </div>
          <Button variant="primary" className="w-full">Send Reset Link</Button>
        </form>
        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-2 font-sans text-body-md text-on-surface-variant hover:text-on-surface transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
