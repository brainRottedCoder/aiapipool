"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2 } from "lucide-react";
import { use } from "react";

export default function ApiKeyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="space-y-8 max-w-3xl">
      <Link href="/dashboard/api-keys" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="font-mono text-label-sm">Back to API Keys</span>
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">Key Detail</h1>
          <p className="font-mono text-code-md text-on-surface-variant">
            sk_live_abcd...efgh
          </p>
        </div>
        <Button variant="destructive" size="sm">
          <Trash2 className="w-4 h-4" />
          Revoke Key
        </Button>
      </div>
      <Card className="card-panel">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Name", value: "Production" },
              { label: "Status", value: "active" },
              { label: "Created", value: "2024-05-01" },
              { label: "Last Used", value: "2 min ago" },
              { label: "Requests", value: "847" },
              { label: "Tokens", value: "1.2M" },
            ].map((d) => (
              <div key={d.label}>
                <p className="font-mono text-label-sm text-on-surface-variant mb-1">{d.label}</p>
                <p className="font-mono text-code-md text-on-surface">{d.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
