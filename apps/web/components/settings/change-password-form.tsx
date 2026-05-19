"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { useChangePassword } from "@/hooks/use-change-password";
import { useMe } from "@/hooks/use-balance";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
};

function formatOAuthProviders(providers: string[]): string {
  const labels = providers.map(
    (p) => PROVIDER_LABELS[p.toLowerCase()] ?? p
  );
  if (labels.length === 0) return "a social provider";
  if (labels.length === 1) return labels[0]!;
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, or ${labels[labels.length - 1]}`;
}

export function ChangePasswordForm() {
  const { data: me, isLoading: meLoading } = useMe();
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("New password must be different from your current password");
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update password");
      }
    }
  };

  if (meLoading) {
    return (
      <p className="font-sans text-body-md text-on-surface-variant">
        Loading security settings…
      </p>
    );
  }

  if (me && !me.has_password) {
    const providerText = formatOAuthProviders(me.oauth_providers ?? []);
    return (
      <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4 space-y-3">
        <p className="font-sans text-body-md text-on-surface">
          Your account was created with {providerText} sign-in and does not
          have a password yet.
        </p>
        <p className="font-sans text-body-md text-on-surface-variant">
          To sign in with email and password, use the forgot password flow to
          set one for your account.
        </p>
        <Link
          href="/forgot-password"
          className="font-sans text-body-md text-primary hover:underline inline-block"
        >
          Set a password via email →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="current">Current Password</Label>
        <Input
          id="current"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <div>
        <Label htmlFor="new">New Password</Label>
        <Input
          id="new"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm New Password</Label>
        <Input
          id="confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={changePassword.isPending}
        >
          {changePassword.isPending ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </form>
  );
}
