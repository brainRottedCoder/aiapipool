"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DOCS_SIDEBAR } from "@/lib/constants";
import { ChevronLeft } from "lucide-react";

export function DocsSidebar() {
  const pathname = usePathname() ?? "";

  return (
    <aside className="w-64 shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pr-4 hidden lg:block">
      <Link
        href="/"
        className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-6 font-mono text-label-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Home
      </Link>
      <nav className="space-y-6">
        {DOCS_SIDEBAR.map((section) => (
          <div key={section.section}>
            <p className="font-mono text-label-sm font-black uppercase tracking-widest text-primary/60 mb-2">
              {section.section}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-3 py-1.5 rounded-md font-sans text-body-md transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-hover"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
