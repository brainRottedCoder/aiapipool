import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Server, Layers, BarChart3 } from "lucide-react";

export default function AdminHealthPage() {
  const healthData = [
    { provider: "OpenRouter", latency: "124ms", uptime: "99.98%", status: "healthy", keys: "6 active" },
    { provider: "Together AI", latency: "95ms", uptime: "99.95%", status: "healthy", keys: "4 active" },
    { provider: "Groq", latency: "18ms", uptime: "99.99%", status: "healthy", keys: "3 active" },
    { provider: "OpenAI", latency: "315ms", uptime: "99.95%", status: "healthy", keys: "5 active" },
    { provider: "Anthropic", latency: "842ms", uptime: "99.90%", status: "degraded", keys: "3 active" },
    { provider: "Gemini", latency: "280ms", uptime: "99.92%", status: "healthy", keys: "3 active" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">System Health</h1>
        <p className="font-sans text-body-md text-on-surface-variant">Provider status, key pool health, and BullMQ queue depths.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-panel-hover p-5">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-sans text-headline-md">Queue Depths</h3>
          </div>
          <div className="space-y-2">
            {[
              { name: "health-check", depth: 0 },
              { name: "balance-sync", depth: 1 },
              { name: "analytics", depth: 3 },
            ].map((q) => (
              <div key={q.name} className="flex justify-between">
                <span className="font-mono text-label-sm text-on-surface-variant">{q.name}</span>
                <span className="font-mono text-code-md text-on-surface">{q.depth}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="card-panel-hover p-5">
          <div className="flex items-center gap-3 mb-3">
            <Server className="w-5 h-5 text-primary" />
            <h3 className="font-sans text-headline-md">Circuit Breakers</h3>
          </div>
          <div className="space-y-2">
            {[
              { name: "Anthropic", state: "CLOSED" },
              { name: "OpenAI", state: "CLOSED" },
              { name: "Groq", state: "CLOSED" },
            ].map((cb) => (
              <div key={cb.name} className="flex justify-between">
                <span className="font-mono text-label-sm text-on-surface-variant">{cb.name}</span>
                <Badge variant="success" className="text-xs">{cb.state}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="card-panel-hover p-5">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-sans text-headline-md">Key Pool</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-mono text-label-sm text-on-surface-variant">Total Keys</span>
              <span className="font-mono text-code-md text-on-surface">24</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-label-sm text-on-surface-variant">Active</span>
              <span className="font-mono text-code-md text-green-400">20</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-label-sm text-on-surface-variant">Exhausted</span>
              <span className="font-mono text-code-md text-red-400">4</span>
            </div>
          </div>
        </Card>
      </div>
      <Card className="card-panel overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-subtle/50">
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Provider</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Status</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Latency</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Uptime</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Keys</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-subtle/30">
              {healthData.map((h) => (
                <tr key={h.provider} className="hover:bg-surface-hover/50">
                  <td className="p-4 font-sans text-body-md text-on-surface">{h.provider}</td>
                  <td className="p-4">
                    <Badge variant={h.status === "healthy" ? "success" : "warning"} className="text-xs">{h.status}</Badge>
                  </td>
                  <td className="p-4 font-mono text-code-md text-on-surface">{h.latency}</td>
                  <td className="p-4 font-mono text-code-md text-on-surface">{h.uptime}</td>
                  <td className="p-4 font-mono text-code-md text-on-surface-variant">{h.keys}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
