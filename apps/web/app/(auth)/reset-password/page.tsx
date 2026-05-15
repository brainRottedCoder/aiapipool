"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/logo";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile py-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="font-sans text-headline-xl mt-6">Set new password</h1>
          <p className="font-sans text-body-md text-on-surface-variant mt-2">Enter your new password below.</p>
        </div>
        <form className="space-y-4">
          <div>
            <label className="font-mono text-label-sm text-on-surface-variant block mb-2">New Password</label>
            <Input type="password" placeholder="Min. 8 characters" className="w-full" />
          </div>
          <div>
            <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Confirm Password</label>
            <Input type="password" placeholder="Re-enter password" className="w-full" />
          </div>
          <Button variant="primary" className="w-full">Reset Password</Button>
        </form>
        <p className="text-center font-sans text-body-md text-on-surface-variant">
          <Link href="/login" className="text-primary hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
