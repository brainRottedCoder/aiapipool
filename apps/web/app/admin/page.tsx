"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminHealth } from "@/hooks/use-health";
import { useAdminOverview } from "@/hooks/use-admin-overview";
import { EmptyState } from "@/components/shared/empty-state";
import { Activity, Users, DollarSign, AlertTriangle, Key, HeartPulse } from "lucide-react";

export default function AdminPage() {
  const { data: health } = useAdminHealth();
  const { data: overview, isLoading } = useAdminOverview();

  const kpis = overview
    ? [
        {
          label: "Active Users",
          value: String(overview.active_users),
          icon: Users,
          change: `${overview.total_users} total · ${overview.suspended_users} suspended`,
        },
        {
          label: "Revenue (24h)",
          value: `$${Number(overview.revenue_24h).toFixed(2)}`,
          icon: DollarSign,
          change: `${overview.requests_24h} requests · ${overview.errors_24h} errors`,
        },
        {
          label: "Provider Keys",
          value: String(
            Object.values(overview.provider_key_counts).reduce((a, b) => a + b, 0)
          ),
          icon: Key,
          change: `${overview.provider_key_counts.EXHAUSTED ?? 0} exhausted`,
        },
        {
          label: "Platform Balance",
          value: `$${Number(overview.total_balance).toFixed(2)}`,
          icon: HeartPulse,
          change: "Sum of user balances",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Admin Overview</h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          System KPIs, revenue, and operational health.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <Card key={i} className="card-panel">
                <CardContent className="p-5 h-24 bg-surface-hover animate-pulse rounded" />
              </Card>
            ))
          : kpis.map((kpi) => (
              <Card key={kpi.label} className="card-panel-hover">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
                      {kpi.label}
                    </span>
                    <kpi.icon className="w-4 h-4 text-on-surface-variant" />
                  </div>
                  <p className="font-sans text-headline-lg text-on-surface">{kpi.value}</p>
                  <p className="font-mono text-label-sm text-on-surface-variant">{kpi.change}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card className="card-panel border-yellow-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="font-sans text-headline-md">Recent Alerts</h3>
          </div>
          <div className="space-y-2">
            {(overview?.recent_alerts ?? [{ level: "INFO", message: "Loading alerts..." }]).map(
              (a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 border-b border-outline-subtle/30 last:border-0"
                >
                  <Badge
                    variant={
                      a.level === "WARN" ? "warning" : a.level === "OK" ? "success" : "default"
                    }
                    className="text-xs shrink-0"
                  >
                    {a.level}
                  </Badge>
                  <span className="font-sans text-body-md text-on-surface-variant">{a.message}</span>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-sans text-headline-md mb-4">Provider Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {health?.providers ? (
            (
              health.providers as Array<{
                provider: string;
                status: string;
                latency: number;
                uptime: number;
              }>
            ).map((p) => (
              <Card key={p.provider} className="card-panel-hover">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-body-lg font-semibold text-on-surface">
                      {p.provider}
                    </span>
                    <Badge
                      variant={
                        p.status === "healthy"
                          ? "success"
                          : p.status === "degraded"
                            ? "warning"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {p.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-body-md">
                    <div>
                      <span className="block text-label-sm text-on-surface-variant">Latency</span>
                      <span className="font-mono text-on-surface">{p.latency}ms</span>
                    </div>
                    <div>
                      <span className="block text-label-sm text-on-surface-variant">Uptime</span>
                      <span className="font-mono text-on-surface">{p.uptime}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState icon={Activity} title="Loading provider health..." description="" />
          )}
        </div>
      </div>
    </div>
  );
}
