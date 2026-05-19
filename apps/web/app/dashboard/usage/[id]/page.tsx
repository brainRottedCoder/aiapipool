"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { useUsageDetail } from "@/hooks/use-usage";

export default function UsageDetailPage() {
  const params = useParams();
  const requestId = (params?.id as string) ?? "";
  const { data: detail, isLoading } = useUsageDetail(requestId);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/usage">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-sans text-headline-xl mb-1">Request Detail</h1>
          <p className="font-sans text-body-md text-on-surface-variant font-mono">{requestId}</p>
        </div>
      </div>

      {isLoading ? (
        <Card className="card-panel">
          <CardContent className="p-6">
            <div className="h-48 bg-surface-hover rounded animate-pulse" />
          </CardContent>
        </Card>
      ) : detail ? (
        <Card className="card-panel">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="font-mono text-label-sm text-on-surface-variant uppercase">Status</p>
                <Badge variant="success" className="mt-1">success</Badge>
              </div>
              <div>
                <p className="font-mono text-label-sm text-on-surface-variant uppercase">Provider</p>
                <p className="font-sans text-body-md text-on-surface mt-1">{(detail as Record<string, unknown>).provider as string}</p>
              </div>
              <div>
                <p className="font-mono text-label-sm text-on-surface-variant uppercase">Model</p>
                <p className="font-sans text-body-md text-on-surface mt-1">{(detail as Record<string, unknown>).model as string}</p>
              </div>
              <div>
                <p className="font-mono text-label-sm text-on-surface-variant uppercase">Latency</p>
                <p className="font-mono text-body-md text-on-surface mt-1">{(detail as Record<string, unknown>).latency_ms as number}ms</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-outline-subtle/30">
              <div>
                <p className="font-mono text-label-sm text-on-surface-variant uppercase">Input Tokens</p>
                <p className="font-mono text-body-md text-on-surface mt-1">{(detail as Record<string, unknown>).tokens_input as number}</p>
              </div>
              <div>
                <p className="font-mono text-label-sm text-on-surface-variant uppercase">Output Tokens</p>
                <p className="font-mono text-body-md text-on-surface mt-1">{(detail as Record<string, unknown>).tokens_output as number}</p>
              </div>
              <div>
                <p className="font-mono text-label-sm text-on-surface-variant uppercase">User Charge</p>
                <p className="font-mono text-body-md text-on-surface mt-1">${Number((detail as Record<string, unknown>).user_charge).toFixed(6)}</p>
              </div>
              <div>
                <p className="font-mono text-label-sm text-on-surface-variant uppercase">Upstream Cost</p>
                <p className="font-mono text-body-md text-on-surface-variant mt-1">${Number((detail as Record<string, unknown>).upstream_cost).toFixed(6)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="Request not found"
          description="The requested log entry could not be found."
          action={
            <Link href="/dashboard/usage">
              <Button variant="primary">Back to Usage</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
