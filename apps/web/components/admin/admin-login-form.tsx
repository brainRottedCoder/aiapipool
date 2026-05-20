"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAdminLogin } from "@/hooks/use-admin-session";

export function AdminLoginForm() {
  const login = useAdminLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (err) {
      const raw =
        err instanceof Error ? err.message : "Invalid email or password";
      const unreachable =
        raw === "Failed to fetch" ||
        raw.includes("NetworkError") ||
        raw.includes("fetch failed");
      const message = unreachable
        ? "Cannot reach API — start the backend (pnpm dev) on port 3000"
        : raw.includes("HTTP")
          ? "Cannot reach API — is the server running on port 3000?"
          : raw;
      toast.error(
        message.toLowerCase().includes("invalid") ||
          message.toLowerCase().includes("credential")
          ? "Invalid email or password"
          : message
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          type="email"
          placeholder="admin@fluxai.dev"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-password">Password</Label>
        <div className="relative">
          <Input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      <Button type="submit" variant="primary" className="w-full" disabled={login.isPending}>
        {login.isPending ? "Signing in..." : "Sign in to Admin"}
      </Button>
    </form>
  );
}
