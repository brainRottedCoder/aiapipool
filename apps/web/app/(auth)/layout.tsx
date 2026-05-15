export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-16">
      <div className="w-full max-w-md mx-auto px-margin-mobile">
        {children}
      </div>
    </div>
  );
}
