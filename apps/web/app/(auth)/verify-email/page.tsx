import { redirect } from "next/navigation";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;

  // Server-side token validation would happen here
  if (!token) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile py-24">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="font-sans text-headline-xl">Email verified</h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Your email has been verified. You can now sign in.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-lg bg-primary-bright text-white px-4 py-2.5 font-medium text-body-md hover:opacity-90 transition-opacity"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
