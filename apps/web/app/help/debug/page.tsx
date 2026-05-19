"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Bug, Terminal, Copy, Check } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export default function DebugPage() {
  const [debugEnabled, setDebugEnabled] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const mockLogs = `2024-05-18T10:42:01Z [INFO] Request routed to provider: openai
2024-05-18T10:42:02Z [INFO] Stream established, 1240 tokens
2024-05-18T10:42:03Z [INFO] Request completed, latency: 315ms
2024-05-18T10:42:05Z [WARN] Rate limit at 58/60 RPM for key sk_live_abcd****
2024-05-18T10:42:10Z [INFO] Balance check: $42.50`;

  return (
    <main className="pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-narrow mx-auto min-h-screen">
      <h1 className="font-sans text-headline-xl mb-4">Debug Logging</h1>
      <p className="font-sans text-body-lg text-on-surface-variant mb-8">
        Enable detailed request logging for troubleshooting. Logs are retained for 30 days.
      </p>

      <Card className="card-panel mb-8">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-body-lg font-medium">Enable Debug Logging</Label>
              <p className="text-body-md text-on-surface-variant mt-1">
                Logs request metadata, provider routing decisions, and latency details.
              </p>
            </div>
            <Switch checked={debugEnabled} onCheckedChange={setDebugEnabled} />
          </div>
        </CardContent>
      </Card>

      {debugEnabled && (
        <Card className="card-panel">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-headline-md flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                Recent Logs
              </h3>
              <Button variant="ghost" size="sm" onClick={() => copy(mockLogs)}>
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="bg-[#070708] border border-outline-subtle rounded-lg p-4 font-mono text-code-md text-on-surface-variant overflow-x-auto whitespace-pre">
              {mockLogs}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
