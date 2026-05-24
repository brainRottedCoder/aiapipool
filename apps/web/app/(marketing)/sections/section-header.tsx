import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  badge?: "soon";
  align?: "center" | "left";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  badge,
  align = "center",
  className = "",
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div className={`mb-14 md:mb-20 ${centered ? "text-center" : ""} ${className}`}>
      <div className={`flex items-center gap-3 mb-6 ${centered ? "justify-center" : ""}`}>
        <span className="landing-eyebrow-dot" />
        <span className="landing-eyebrow">{eyebrow}</span>
        {badge === "soon" && <span className="landing-badge-soon">Launching Soon</span>}
      </div>
      <h2 className={`landing-title ${centered ? "mx-auto max-w-4xl" : "max-w-3xl"}`}>{title}</h2>
      {description && (
        <p className={`landing-desc mt-6 ${centered ? "mx-auto max-w-2xl" : "max-w-xl"}`}>{description}</p>
      )}
    </div>
  );
}
