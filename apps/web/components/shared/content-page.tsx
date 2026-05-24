import { cn } from "@/lib/utils";

interface ContentPageProps {
  title: string;
  description?: string;
  lastUpdated?: string;
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}

export function ContentPage({
  title,
  description,
  lastUpdated,
  children,
  className,
  narrow = true,
}: ContentPageProps) {
  return (
    <main
      className={cn(
        "pt-24 pb-16 px-margin-mobile md:px-margin-desktop min-h-screen",
        narrow ? "max-w-narrow mx-auto" : "max-w-content mx-auto",
        className,
      )}
    >
      <header className="mb-10">
        <h1 className="font-sans text-headline-xl mb-4">{title}</h1>
        {description && (
          <p className="font-sans text-body-lg text-on-surface-variant">{description}</p>
        )}
        {lastUpdated && (
          <p className="font-mono text-label-sm text-on-surface-variant mt-4">
            Last updated: {lastUpdated}
          </p>
        )}
      </header>
      <article className="prose-legal space-y-8">{children}</article>
    </main>
  );
}

interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
  id?: string;
}

export function ContentSection({ title, children, id }: ContentSectionProps) {
  return (
    <section id={id} className="space-y-3">
      <h2 className="font-sans text-headline-md text-on-surface">{title}</h2>
      <div className="font-sans text-body-md text-on-surface-variant space-y-3 leading-relaxed">
        {children}
      </div>
    </section>
  );
}
