"use client";

import { Logo } from "@/components/shared/logo";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile py-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-outline-subtle bg-surface mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-mono text-label-sm text-on-surface-variant">Operator Portal</span>
          </div>
          <h1 className="font-sans text-headline-xl mt-2">Admin sign in</h1>
          <p className="font-sans text-body-md text-on-surface-variant mt-2">
            Credentials only — not linked to customer accounts
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
