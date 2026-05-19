"use client";

import { useApiKeys, useRevokeApiKey } from "@/hooks/use-api-keys";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Key, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function ApiKeyCard() {
  const { data: keys, isLoading } = useApiKeys();
  const revoke = useRevokeApiKey();

  const handleRevoke = (id: string) => {
    revoke.mutate(id, {
      onSuccess: () => toast.success("API key revoked"),
      onError: () => toast.error("Failed to revoke key"),
    });
  };

  return (
    <Card className="card-panel">
      <CardContent className="p-6">
        <h3 className="font-sans text-headline-md mb-4">Active API Keys</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-surface-hover rounded animate-pulse" />
            ))}
          </div>
        ) : keys && keys.length > 0 ? (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between py-3 border-b border-outline-subtle/30 last:border-0"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-sans text-body-md text-on-surface">
                      {key.name ?? "Unnamed Key"}
                    </p>
                    <Badge variant="success" className="text-xs">{key.status}</Badge>
                  </div>
                  <p className="font-mono text-label-sm text-on-surface-variant">
                    {key.key_prefix}****
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/api-keys/${key.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleRevoke(key.id)}
                    disabled={revoke.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Key}
            title="No API keys yet"
            description="Create your first API key to start making requests."
            action={
              <Link href="/dashboard/api-keys/create">
                <Button variant="primary" size="sm">Create API Key</Button>
              </Link>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
