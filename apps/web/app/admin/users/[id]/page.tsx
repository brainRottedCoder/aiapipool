"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { adminApiClient, ADMIN_ENDPOINTS } from "@/lib/admin-api-client";
import { EmptyState } from "@/components/shared/empty-state";
import { ArrowLeft, User, Ban, CheckCircle, Activity } from "lucide-react";
import type { UserAdmin, UserUsageLog, LedgerEntry } from "@/types/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "usage" | "ledger";

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const [tab, setTab] = useState<Tab>("usage");

  const { data: user, isLoading, refetch } = useQuery<UserAdmin>({
    queryKey: ["admin-user", id],
    queryFn: () => adminApiClient.get(ADMIN_ENDPOINTS.userDetail(id)),
    enabled: !!id,
  });

  const { data: summary } = useQuery({
    queryKey: ["admin-user-summary", id],
    queryFn: () => adminApiClient.get(ADMIN_ENDPOINTS.userSummary(id)),
    enabled: !!id,
  });

  const { data: usage } = useQuery({
    queryKey: ["admin-user-usage", id],
    queryFn: async () => {
      const res = await adminApiClient.get<{ data: UserUsageLog[] }>(ADMIN_ENDPOINTS.userUsage(id));
      return res.data;
    },
    enabled: !!id && tab === "usage",
  });

  const { data: ledger } = useQuery({
    queryKey: ["admin-user-ledger", id],
    queryFn: async () => {
      const res = await adminApiClient.get<{ data: LedgerEntry[] }>(ADMIN_ENDPOINTS.userLedger(id));
      return res.data;
    },
    enabled: !!id && tab === "ledger",
  });

  const handleBanToggle = async () => {
    if (!user) return;
    try {
      if (user.status === "active") {
        await adminApiClient.patch(ADMIN_ENDPOINTS.userSuspend(id), {});
        toast.success("User banned");
      } else {
        await adminApiClient.patch(ADMIN_ENDPOINTS.userUnsuspend(id), {});
        toast.success("User unbanned");
      }
      refetch();
    } catch {
      toast.error("Action failed");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-surface-hover rounded animate-pulse w-48" />
        <Card className="card-panel">
          <CardContent className="p-6">
            <div className="h-48 bg-surface-hover rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <EmptyState
          icon={User}
          title="User not found"
          description="The requested user could not be found."
          action={
            <Link href="/admin/users">
              <Button variant="primary">Back to Users</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const allTime = summary?.all_time as
    | { request_count: number; total_charged: string; tokens_input: number; tokens_output: number }
    | undefined;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-sans text-headline-xl mb-1 truncate">{user.name ?? user.email}</h1>
          <p className="font-sans text-body-md text-on-surface-variant font-mono">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={user.status === "active" ? "success" : "destructive"} className="text-xs">
            {user.status}
          </Badge>
          <Button
            variant={user.status === "active" ? "destructive" : "primary"}
            size="sm"
            onClick={handleBanToggle}
          >
            {user.status === "active" ? (
              <>
                <Ban className="w-4 h-4 mr-2" /> Ban
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" /> Unban
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Balance</p>
            <p className="font-sans text-headline-lg text-on-surface">
              ${Number(user.balance).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Requests</p>
            <p className="font-sans text-headline-lg text-on-surface">{allTime?.request_count ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Total spent</p>
            <p className="font-sans text-headline-lg text-on-surface">
              ${Number(allTime?.total_charged ?? 0).toFixed(4)}
            </p>
          </CardContent>
        </Card>
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Joined</p>
            <p className="font-sans text-headline-lg text-on-surface">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-outline-subtle">
        {(["usage", "ledger"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 font-mono text-label-sm capitalize border-b-2 -mb-px transition-colors",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <Card className="card-panel overflow-hidden">
        <CardContent className="p-0">
          {tab === "usage" ? (
            usage && usage.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-subtle/50">
                    <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Model</th>
                    <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Tokens</th>
                    <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Charge</th>
                    <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Latency</th>
                    <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Status</th>
                    <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-subtle/30">
                  {usage.map((row) => (
                    <tr key={row.id}>
                      <td className="p-4 font-mono text-code-md">{row.model}</td>
                      <td className="p-4 font-mono text-code-md">
                        {row.tokens_input + row.tokens_output}
                      </td>
                      <td className="p-4 font-mono text-code-md">${Number(row.user_charge).toFixed(6)}</td>
                      <td className="p-4 font-mono text-code-md">{row.latency_ms}ms</td>
                      <td className="p-4">
                        <Badge variant={row.status === "success" ? "success" : "destructive"} className="text-xs">
                          {row.status}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono text-code-md text-on-surface-variant">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8">
                <EmptyState icon={Activity} title="No usage yet" description="" />
              </div>
            )
          ) : ledger && ledger.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-subtle/50">
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Type</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Amount</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Balance after</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-subtle/30">
                {ledger.map((row) => (
                  <tr key={row.id}>
                    <td className="p-4 font-mono text-code-md capitalize">{row.type}</td>
                    <td className="p-4 font-mono text-code-md">${Number(row.amount).toFixed(4)}</td>
                    <td className="p-4 font-mono text-code-md">${Number(row.balance_after).toFixed(4)}</td>
                    <td className="p-4 font-mono text-code-md text-on-surface-variant">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8">
              <EmptyState icon={Activity} title="No ledger entries" description="" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
