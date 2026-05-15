import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function UsageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <Link href="/dashboard/usage" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="font-mono text-label-sm">Back to Usage</span>
      </Link>
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Request Detail</h1>
        <p className="font-mono text-code-md text-on-surface-variant">ID: {id}</p>
      </div>
      <Card className="card-panel">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Model", value: "gpt-4o" },
              { label: "Provider", value: "OpenAI" },
              { label: "Status", value: "success", badge: "success" },
              { label: "Timestamp", value: "2024-05-15 10:42:01 UTC" },
              { label: "Input Tokens", value: "150" },
              { label: "Output Tokens", value: "450" },
              { label: "Latency", value: "245ms" },
              { label: "Cost", value: "$0.0031" },
            ].map((d, i) => (
              <div key={i}>
                <p className="font-mono text-label-sm text-on-surface-variant mb-1">{d.label}</p>
                {d.badge ? (
                  <Badge variant="success" className="text-xs">{d.value}</Badge>
                ) : (
                  <p className="font-mono text-code-md text-on-surface">{d.value}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="card-panel p-6">
        <p className="font-mono text-label-sm text-on-surface-variant">
          Message content is never stored or displayed by default.
        </p>
      </Card>
    </div>
  );
}
