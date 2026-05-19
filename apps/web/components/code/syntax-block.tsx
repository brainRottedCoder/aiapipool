"use client";

import { useState, useEffect } from "react";
import { codeToHtml } from "shiki";
import { Copy, Check } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

interface SyntaxBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function SyntaxBlock({ code, language, showLineNumbers = false, className }: SyntaxBlockProps) {
  const [html, setHtml] = useState<string>("");
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    codeToHtml(code, {
      lang: language,
      theme: "github-dark",
    }).then(setHtml);
  }, [code, language]);

  return (
    <div className={cn("relative group rounded-lg border border-outline-subtle overflow-hidden bg-[#0d1117]", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-outline-subtle/50 bg-[#161b22]">
        <span className="font-mono text-label-sm text-on-surface-variant">{language}</span>
        <button
          onClick={() => copy(code)}
          className="p-1.5 rounded hover:bg-white/5 transition-colors text-on-surface-variant hover:text-on-surface"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div
        className="p-4 overflow-x-auto font-mono text-code-md"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
