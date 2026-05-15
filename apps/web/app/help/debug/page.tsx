"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function DebugPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <Link href="/help" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="font-mono text-label-sm">Back to Help</span>
      </Link>
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Debug Logging</h1>
        <p className="font-sans text-body-md text-on-surface-variant">Enable opt-in request content logging for troubleshooting purposes.</p>
      </div>
      <Card className="card-panel border-yellow-500/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="font-sans text-headline-md text-on-surface">Privacy Warning</h3>
              <p className="font-sans text-body-md text-on-surface-variant">
                When enabled, message content (prompts and completions) will be logged for debugging.
                Content is retained for 30 days and PII is automatically redacted.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-body-md text-on-surface font-medium">Content Logging</p>
              <p className="font-sans text-body-md text-on-surface-variant">Currently disabled</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-9 h-5 bg-surface-hover peer-checked:bg-yellow-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
