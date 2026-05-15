"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-margin-mobile">
      <div className="text-center space-y-6">
        <p className="font-mono text-label-sm text-red-400">Error</p>
        <h1 className="font-sans text-display-lg text-on-surface">Something went wrong</h1>
        <p className="font-sans text-body-lg text-on-surface-variant max-w-md mx-auto">
          An unexpected error occurred. Please try again or return home.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
          <Link href="/">
            <Button variant="secondary">Go Home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
