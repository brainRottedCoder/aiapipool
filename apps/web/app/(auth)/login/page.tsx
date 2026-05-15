"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/logo";
import { Github, Chrome } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile py-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="font-sans text-headline-xl mt-6">Welcome back</h1>
          <p className="font-sans text-body-md text-on-surface-variant mt-2">Sign in to your SAPI account</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="w-full">
              <Github className="w-4 h-4" />
              GitHub
            </Button>
            <Button variant="secondary" className="w-full">
              <Chrome className="w-4 h-4" />
              Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-subtle" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 font-mono text-label-sm text-on-surface-variant">or continue with email</span>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Email</label>
              <Input type="email" placeholder="architect@company.com" className="w-full" />
            </div>
            <div>
              <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Password</label>
              <Input type="password" placeholder="Enter your password" className="w-full" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded bg-surface border-outline-subtle accent-primary" />
                <span className="font-sans text-body-md text-on-surface-variant">Remember me</span>
              </label>
              <Link href="/forgot-password" className="font-sans text-body-md text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button variant="primary" className="w-full">Sign in</Button>
          </form>
        </div>

        <p className="text-center font-sans text-body-md text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
