"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DOCS_SIDEBAR } from "@/lib/constants";
import { Footer } from "@/components/shared/footer";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div className="pt-16 min-h-screen flex">
      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-outline-subtle bg-background hidden md:flex flex-col z-30">
        <div className="p-4 border-b border-outline-subtle/30">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
            <input
              className="w-full bg-surface border border-outline-subtle rounded-lg pl-9 pr-3 py-1.5 font-mono text-label-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary-bright"
              placeholder="Search docs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {DOCS_SIDEBAR.map((section) => {
            const isExpanded = expanded[section.section] !== false;
            return (
              <div key={section.section} className="mb-4">
                <button
                  onClick={() => setExpanded((p) => ({ ...p, [section.section]: !isExpanded }))}
                  className="w-full flex items-center gap-1 px-4 py-1 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-on-surface-variant" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-on-surface-variant" />
                  )}
                  <span className="font-mono text-label-sm font-black uppercase tracking-widest text-primary/60">
                    {section.section}
                  </span>
                </button>
                {isExpanded && (
                  <div className="mt-1">
                    {section.items.map((item) => {
                      let isActive = false;
                      if (item.href.includes("#")) {
                        isActive = pathname === item.href.split("#")[0];
                      } else {
                        isActive = pathname === item.href;
                      }
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center px-4 py-2 text-body-md transition-colors",
                            isActive
                              ? "text-primary bg-primary/10 border-l-3 border-primary"
                              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-hover border-l-3 border-transparent"
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 md:ml-64">
        <main className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-8 min-h-screen">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
