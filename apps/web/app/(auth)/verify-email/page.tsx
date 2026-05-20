"use client";

import { useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ENDPOINTS } from "@/lib/api-endpoints";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "";
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d?$/.test(value)) return;
      const next = [...otp];
      next[index] = value;
      setOtp(next);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] ?? "";
    }
    setOtp(newOtp);
    const nextFocus = Math.min(pasted.length, 5);
    inputRefs.current[nextFocus]?.focus();
  }, [otp]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(ENDPOINTS.api.verifyEmail, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Verification failed");
      }
      toast.success("Email verified successfully");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile py-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-sans text-headline-xl">Check your inbox</h1>
          <p className="font-sans text-body-md text-on-surface-variant mt-2">
            We sent a 6-digit verification code to{" "}
            <span className="font-medium text-on-surface">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-mono border border-outline rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                autoFocus={i === 0}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-primary-bright text-white px-4 py-2.5 font-medium text-body-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="font-sans text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-on-surface-variant">Loading...</p>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
