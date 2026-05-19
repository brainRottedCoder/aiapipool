"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApiClient, ADMIN_ENDPOINTS } from "@/lib/admin-api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { TrendingUp } from "lucide-react";
import type { MarginReport } from "@/types/api";

export default function AdminMarginsPage() {
  const [period, setPeriod] = useState("daily");

  const { data: margins, isLoading } = useQuery<MarginReport[]>({
    queryKey: ["admin-margins", period],
    queryFn: () => {
      const url = new URL(ADMIN_ENDPOINTS.margins);
      url.searchParams.set("period", period);
      return adminApiClient.get(url.toString());
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">Margin Analytics</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Revenue, upstream cost, and margin breakdown.
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Total Revenue</p>
            <p className="font-sans text-headline-lg text-on-surface">
              ${margins?.reduce((s, m) => s + Number(m.total_user_charges), 0).toFixed(2) ?? "0.00"}
            </p>
          </CardContent>
        </Card>
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Upstream Cost</p>
            <p className="font-sans text-headline-lg text-on-surface">
              ${margins?.reduce((s, m) => s + Number(m.total_upstream_cost), 0).toFixed(2) ?? "0.00"}
            </p>
          </CardContent>
        </Card>
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Net Margin</p>
            <p className="font-sans text-headline-lg text-green-400">
              ${margins?.reduce((s, m) => s + Number(m.total_margin), 0).toFixed(2) ?? "0.00"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Margins Table */}
      <Card className="card-panel overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-surface-hover rounded animate-pulse" />
              ))}
            </div>
          ) : margins && margins.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-subtle/50">
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Period</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Revenue</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Upstream Cost</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Margin</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-subtle/30">
                {margins.map((m, i) => {
                  const revenue = Number(m.total_user_charges);
                  const marginPct = revenue > 0 ? ((Number(m.total_margin) / revenue) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={i} className="hover:bg-surface-hover/50">
                      <td className="p-4 font-sans text-body-md text-on-surface">{m.period}</td>
                      <td className="p-4 font-mono text-body-md text-on-surface">${Number(m.total_user_charges).toFixed(2)}</td>
                      <td className="p-4 font-mono text-body-md text-on-surface-variant">${Number(m.total_upstream_cost).toFixed(2)}</td>
                      <td className="p-4 font-mono text-body-md text-green-400">${Number(m.total_margin).toFixed(2)}</td>
                      <td className="p-4 font-mono text-body-md text-primary">{marginPct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={TrendingUp}
                title="No margin data"
                description="Margin reports will appear once API usage begins."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
