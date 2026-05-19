"use client";

import { useState } from "react";
import { SyntaxBlock } from "./syntax-block";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  language: string;
  code: string;
}

interface CodeTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function CodeTabs({ tabs, defaultTab, className }: CodeTabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.label ?? "");
  const current = tabs.find((t) => t.label === active) ?? tabs[0];

  return (
    <div className={cn("rounded-lg border border-outline-subtle overflow-hidden", className)}>
      <div className="flex border-b border-outline-subtle/50 bg-surface">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActive(tab.label)}
            className={cn(
              "px-4 py-2 font-mono text-label-sm transition-colors border-b-2 -mb-px",
              active === tab.label
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-hover"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {current && (
        <SyntaxBlock
          code={current.code}
          language={current.language}
          className="border-0 rounded-none"
        />
      )}
    </div>
  );
}
