"use client";

import { useAdminHealth } from "@/hooks/use-health";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { HeartPulse, Activity, Key, Database } from "lucide-react";

export default function AdminHealthPage() {
  const { data: health, isLoading } = useAdminHealth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">System Health</h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Provider status, key pool health, and queue depths.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="card-panel">
              <CardContent className="p-6">
                <div className="h-24 bg-surface-hover rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : health ? (
        <>
          {/* Provider Health */}
          <div>
            <h2 className="font-sans text-headline-md mb-4 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-primary" />
              Provider Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(health.providers as Array<{ provider: string; status: string; latency: number; uptime: number }>)?.map((p) => (
                <Card key={p.provider} className="card-panel-hover">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-body-lg font-semibold text-on-surface">{p.provider}</span>
                      <Badge
                        variant={p.status === "healthy" ? "success" : p.status === "degraded" ? "warning" : "destructive"}
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
              )) ?? (
                <EmptyState icon={HeartPulse} title="No provider data" description="Health checks will populate this section." />
              )}
            </div>
          </div>

          {/* Key Pool Stats */}
          <div>
            <h2 className="font-sans text-headline-md mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Key Pool Statistics
            </h2>
            <Card className="card-panel">
              <CardContent className="p-6">
                <pre className="font-mono text-code-md text-on-surface-variant overflow-x-auto">
                  {JSON.stringify(health.keys, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Queue Depths */}
          <div>
            <h2 className="font-sans text-headline-md mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              BullMQ Queue Depths
            </h2>
            <Card className="card-panel">
              <CardContent className="p-6">
                <pre className="font-mono text-code-md text-on-surface-variant overflow-x-auto">
                  {JSON.stringify(health.queues, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <EmptyState icon={Activity} title="Health data unavailable" description="Unable to fetch system health metrics." />
      )}
    </div>
  );
}
