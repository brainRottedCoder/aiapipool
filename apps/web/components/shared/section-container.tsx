import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionContainer({ children, className, id }: SectionContainerProps) {
  return (
    <section
      id={id}
      className={cn(
        "max-w-content mx-auto px-margin-mobile md:px-margin-desktop",
        className
      )}
    >
      {children}
    </section>
  );
}
