import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-margin-mobile">
      <div className="text-center space-y-6">
        <p className="font-mono text-label-sm text-primary">404</p>
        <h1 className="font-sans text-display-lg text-on-surface">Page not found</h1>
        <p className="font-sans text-body-lg text-on-surface-variant max-w-md mx-auto">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="primary">Go Home</Button>
          </Link>
          <Link href="/docs">
            <Button variant="secondary">View Docs</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
