"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminActivity } from "@/hooks/use-admin-activity";
import { Activity, ScrollText, Shield } from "lucide-react";

export default function AdminActivityPage() {
  const { data, isLoading } = useAdminActivity(60);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Platform Activity</h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Recent requests, ledger events, and operator audit logs.
        </p>
      </div>

      {isLoading ? (
        <div className="h-48 bg-surface-hover rounded animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ActivitySection
            title="API Requests"
            icon={Activity}
            empty="No recent requests"
            rows={(data?.requests ?? []).map((r) => ({
              id: r.id,
              primary: r.user_email,
              secondary: `${r.model} · $${Number(r.user_charge).toFixed(4)}`,
              meta: `${r.latency_ms}ms · ${r.status}`,
              time: r.created_at,
            }))}
          />
          <ActivitySection
            title="Ledger"
            icon={ScrollText}
            empty="No ledger events"
            rows={(data?.ledger ?? []).map((r) => ({
              id: r.id,
              primary: r.user_email,
              secondary: `${r.ledger_type} · $${Number(r.amount).toFixed(4)}`,
              meta: `balance $${Number(r.balance_after).toFixed(2)}`,
              time: r.created_at,
            }))}
          />
          <ActivitySection
            title="Audit Log"
            icon={Shield}
            empty="No audit events"
            rows={(data?.audits ?? []).map((r) => ({
              id: r.id,
              primary: r.admin_email,
              secondary: r.action,
              meta: r.target_id ? `${r.target_type}:${r.target_id}` : "",
              time: r.created_at,
            }))}
          />
        </div>
      )}
    </div>
  );
}

function ActivitySection({
  title,
  icon: Icon,
  empty,
  rows,
}: {
  title: string;
  icon: React.ElementType;
  empty: string;
  rows: Array<{
    id: string;
    primary: string;
    secondary: string;
    meta: string;
    time: string;
  }>;
}) {
  return (
    <Card className="card-panel">
      <CardContent className="p-6">
        <h3 className="font-sans text-headline-md mb-4 flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </h3>
        {rows.length === 0 ? (
          <p className="font-sans text-body-md text-on-surface-variant">{empty}</p>
        ) : (
          <ul className="space-y-3 max-h-[480px] overflow-y-auto">
            {rows.map((row) => (
              <li
                key={row.id}
                className="py-2 border-b border-outline-subtle/30 last:border-0 space-y-1"
              >
                <p className="font-sans text-body-md text-on-surface truncate">{row.primary}</p>
                <p className="font-mono text-label-sm text-on-surface-variant">{row.secondary}</p>
                {row.meta ? (
                  <Badge variant="outline" className="text-xs">
                    {row.meta}
                  </Badge>
                ) : null}
                <p className="font-mono text-label-sm text-on-surface-variant/70">
                  {new Date(row.time).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
