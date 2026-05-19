"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApiKeys, useRevokeApiKey } from "@/hooks/use-api-keys";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";
import { ArrowLeft, Key, Trash2, BarChart3 } from "lucide-react";

export default function ApiKeyDetailPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const { data: keys, isLoading } = useApiKeys();
  const revoke = useRevokeApiKey();

  const key = keys?.find((k) => k.id === id);

  const handleRevoke = () => {
    revoke.mutate(id, {
      onSuccess: () => toast.success("API key revoked"),
      onError: () => toast.error("Failed to revoke key"),
    });
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

  if (!key) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/api-keys">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <EmptyState
          icon={Key}
          title="API Key not found"
          description="The requested key does not exist or has been revoked."
          action={
            <Link href="/dashboard/api-keys">
              <Button variant="primary">Back to API Keys</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/api-keys">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-sans text-headline-xl mb-1">{key.name ?? "Unnamed Key"}</h1>
          <p className="font-sans text-body-md text-on-surface-variant font-mono">{key.key_prefix}****</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant={key.status === "active" ? "success" : "destructive"} className="text-xs">
            {key.status}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300"
            onClick={handleRevoke}
            disabled={revoke.isPending || key.status !== "active"}
          >
            <Trash2 className="w-4 h-4" />
            Revoke
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Rate Limit (RPM)</p>
            <p className="font-sans text-headline-lg text-on-surface">{key.rate_limit_rpm}</p>
          </CardContent>
        </Card>
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Tokens / Day</p>
            <p className="font-sans text-headline-lg text-on-surface">{key.rate_limit_tokens_day.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Created</p>
            <p className="font-sans text-headline-lg text-on-surface">
              {new Date(key.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-panel">
        <CardContent className="p-6">
          <h3 className="font-sans text-headline-md mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Usage Stats
          </h3>
          <EmptyState
            icon={BarChart3}
            title="Usage data unavailable"
            description="Per-key usage breakdown will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}
