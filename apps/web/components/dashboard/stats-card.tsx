"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendColor?: string;
  loading?: boolean;
}

export function StatsCard({ label, value, icon: Icon, trend, trendColor = "text-on-surface-variant", loading }: StatsCardProps) {
  return (
    <Card className="card-panel-hover">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
            {label}
          </span>
          <Icon className="w-4 h-4 text-on-surface-variant" />
        </div>
        {loading ? (
          <div className="h-8 bg-surface-hover rounded animate-pulse" />
        ) : (
          <p className="font-sans text-headline-lg text-on-surface">{value}</p>
        )}
        {trend && (
          <p className={cn("font-mono text-label-sm", trendColor)}>{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}
