import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UsagePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Usage Analytics</h1>
        <p className="font-sans text-body-md text-on-surface-variant">Token consumption, request volume, and latency over time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: "12,847", change: "+18%" },
          { label: "Total Tokens", value: "3.2M", change: "+22%" },
          { label: "Avg Latency", value: "245ms", change: "-5%" },
          { label: "Cost", value: "$8.42", change: "+15%" },
        ].map((s) => (
          <Card key={s.label} className="card-panel-hover">
            <CardContent className="p-5 space-y-2">
              <p className="font-mono text-label-sm text-on-surface-variant">{s.label}</p>
              <p className="font-sans text-headline-lg text-on-surface">{s.value}</p>
              <Badge variant="outline" className="text-xs">{s.change}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-panel">
          <CardContent className="p-6">
            <h3 className="font-sans text-headline-md mb-4">Token Burn Over Time</h3>
            <div className="h-[250px] flex items-end gap-1">
              {[40, 65, 50, 80, 60, 85, 70, 90, 75, 95, 65, 80, 55, 70, 45, 85, 60, 92, 72, 88].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/30 hover:bg-primary/50 rounded-t transition-colors" style={{ height: `${h}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="card-panel">
          <CardContent className="p-6">
            <h3 className="font-sans text-headline-md mb-4">Model Breakdown</h3>
            <div className="space-y-3">
              {[
                { model: "gpt-4o", pct: 45, tokens: "1.4M" },
                { model: "claude-3.5-sonnet", pct: 28, tokens: "896K" },
                { model: "llama-3.1-70b", pct: 18, tokens: "576K" },
                { model: "mixtral-8x7b", pct: 9, tokens: "288K" },
              ].map((m) => (
                <div key={m.model}>
                  <div className="flex justify-between text-body-md mb-1">
                    <span className="text-on-surface">{m.model}</span>
                    <span className="font-mono text-on-surface-variant">{m.tokens}</span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
