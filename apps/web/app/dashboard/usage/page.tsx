"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUsage } from "@/hooks/use-usage";
import { useModels } from "@/hooks/use-models";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { BarChart3, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function UsagePage() {
  const [period, setPeriod] = useState<"day" | "month">("day");
  const [modelFilter, setModelFilter] = useState("");
  const { data: usage, isLoading } = useUsage(period, modelFilter || undefined);
  const { data: models } = useModels();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">Usage Analytics</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Token burn, request volume, and latency breakdown.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as "day" | "month")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
          {models && (
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All models</SelectItem>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.model_alias}>
                    {m.model_alias}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Charts */}
      <UsageChart period={period === "day" ? "7D" : "30D"} />

      {/* Usage Table */}
      <Card className="card-panel">
        <CardContent className="p-6">
          <h3 className="font-sans text-headline-md mb-4">Usage Breakdown</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-surface-hover rounded animate-pulse" />
              ))}
            </div>
          ) : usage && usage.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-subtle/50">
                    <th className="text-left p-3 font-mono text-label-sm text-on-surface-variant">Period</th>
                    <th className="text-left p-3 font-mono text-label-sm text-on-surface-variant">Requests</th>
                    <th className="text-left p-3 font-mono text-label-sm text-on-surface-variant">Input Tokens</th>
                    <th className="text-left p-3 font-mono text-label-sm text-on-surface-variant">Output Tokens</th>
                    <th className="text-left p-3 font-mono text-label-sm text-on-surface-variant">Cost</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-subtle/30">
                  {usage.map((u, i) => (
                    <tr key={i} className="hover:bg-surface-hover/50">
                      <td className="p-3 font-sans text-body-md text-on-surface">{u.period}</td>
                      <td className="p-3 font-mono text-body-md text-on-surface">{u.requests.toLocaleString()}</td>
                      <td className="p-3 font-mono text-body-md text-on-surface-variant">{u.tokens_input.toLocaleString()}</td>
                      <td className="p-3 font-mono text-body-md text-on-surface-variant">{u.tokens_output.toLocaleString()}</td>
                      <td className="p-3 font-mono text-body-md text-on-surface">${Number(u.user_charge).toFixed(4)}</td>
                      <td className="p-3 text-right">
                        <Link href={`/dashboard/usage/${i}`}>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No usage data yet"
              description="Start making API calls to see your usage analytics here."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
