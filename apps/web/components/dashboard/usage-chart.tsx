"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { BarChart3 } from "lucide-react";

interface UsageChartProps {
  data?: number[];
  period?: "7D" | "30D" | "90D";
}

export function UsageChart({ data, period = "7D" }: UsageChartProps) {
  const defaultData = data ?? [65, 45, 78, 56, 90, 72, 85, 60, 88, 92, 75, 68, 55, 82, 70, 95, 88, 75, 62, 80];
  const periods = ["7D", "30D", "90D"] as const;

  return (
    <Card className="card-panel">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-sans text-headline-md">Token Burn ({period})</h3>
          <div className="flex gap-2">
            {periods.map((t) => (
              <Badge
                key={t}
                variant={t === period ? "default" : "outline"}
                className="cursor-pointer text-xs"
              >
                {t}
              </Badge>
            ))}
          </div>
        </div>
        {defaultData.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No usage data yet"
            description="Start making API calls to see your usage analytics."
          />
        ) : (
          <div className="h-[200px] flex items-end gap-1">
            {defaultData.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/30 hover:bg-primary/50 rounded-t transition-colors"
                style={{ height: `${h}%` }}
                title={`${h}%`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
