import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminMarginsPage() {
  const models = [
    { model: "gpt-4o", revenue: "$142.50", cost: "$110.20", margin: "$32.30", marginPct: "22.7%", requests: "4,200" },
    { model: "claude-3.5-sonnet", revenue: "$85.30", cost: "$68.50", margin: "$16.80", marginPct: "19.7%", requests: "2,100" },
    { model: "llama-3.1-70b", revenue: "$45.20", cost: "$36.80", margin: "$8.40", marginPct: "18.6%", requests: "5,800" },
    { model: "mixtral-8x7b", revenue: "$18.90", cost: "$15.10", margin: "$3.80", marginPct: "20.1%", requests: "3,400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Margin Analytics</h1>
        <p className="font-sans text-body-md text-on-surface-variant">Revenue breakdown by model with profit margins.</p>
      </div>
      <div className="flex gap-2">
        {["daily", "weekly", "monthly"].map((p) => (
          <Badge key={p} variant={p === "daily" ? "default" : "outline"} className="cursor-pointer text-xs capitalize">{p}</Badge>
        ))}
      </div>
      <Card className="card-panel overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-subtle/50">
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Model</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Revenue</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Cost</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Margin</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Margin %</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Requests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-subtle/30">
              {models.map((m) => (
                <tr key={m.model} className="hover:bg-surface-hover/50">
                  <td className="p-4 font-sans text-body-md text-on-surface">{m.model}</td>
                  <td className="p-4 font-mono text-code-md text-on-surface">{m.revenue}</td>
                  <td className="p-4 font-mono text-code-md text-on-surface-variant">{m.cost}</td>
                  <td className="p-4 font-mono text-code-md text-green-400">{m.margin}</td>
                  <td className="p-4"><Badge variant="success" className="text-xs">{m.marginPct}</Badge></td>
                  <td className="p-4 font-mono text-code-md text-on-surface-variant">{m.requests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
