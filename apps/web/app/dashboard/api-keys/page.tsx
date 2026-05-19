"use client";

import { useState } from "react";
import Link from "next/link";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/hooks/use-api-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Copy, Check, Trash2, Eye, Key } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";

export default function ApiKeysPage() {
  const { data: keys, isLoading } = useApiKeys();
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();
  const { copied, copy } = useCopyToClipboard();
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState("");

  const handleCreate = () => {
    createKey.mutate(keyName, {
      onSuccess: (data) => {
        setNewKey(data.raw_key);
        setShowCreate(true);
        setKeyName("");
      },
      onError: () => toast.error("Failed to create API key"),
    });
  };

  const handleRevoke = (id: string) => {
    revokeKey.mutate(id, {
      onSuccess: () => toast.success("API key revoked"),
      onError: () => toast.error("Failed to revoke key"),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">API Keys</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Manage your API keys for programmatic access.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreate(true)}
          disabled={createKey.isPending}
        >
          <Plus className="w-4 h-4" />
          Create Key
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="card-panel">
              <CardContent className="p-6">
                <div className="h-16 bg-surface-hover rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : keys && keys.length > 0 ? (
        keys.map((key) => (
          <Card key={key.id} className="card-panel-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-sans text-headline-md text-on-surface">
                      {key.name ?? "Unnamed Key"}
                    </h3>
                    <Badge variant="success" className="text-xs">
                      {key.status}
                    </Badge>
                  </div>
                  <p className="font-mono text-code-md text-on-surface-variant">
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
                    disabled={revokeKey.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-6 mt-3 text-body-md text-on-surface-variant">
                <span>RPM: {key.rate_limit_rpm}</span>
                <span>Tokens/day: {key.rate_limit_tokens_day.toLocaleString()}</span>
                <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <EmptyState
          icon={Key}
          title="No API keys yet"
          description="Create your first API key to start making requests to the gateway."
          action={
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              Create API Key
            </Button>
          }
        />
      )}

      {/* Create Key Dialog */}
      <Dialog open={showCreate && !newKey} onOpenChange={(open) => { setShowCreate(open); if (!open) setKeyName(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Give your key a name to identify it later.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Production, Development, etc."
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={createKey.isPending || !keyName.trim()}
            >
              {createKey.isPending ? "Creating..." : "Create Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show Raw Key Once */}
      <Dialog open={!!newKey} onOpenChange={() => { setNewKey(null); setShowCreate(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy your API key now. You won&apos;t be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-surface border border-outline-subtle rounded-lg p-4 flex items-center justify-between gap-4">
            <code className="font-mono text-code-md text-on-surface break-all">{newKey}</code>
            <button
              onClick={() => newKey && copy(newKey)}
              className="p-2 hover:bg-surface-hover rounded transition-colors shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-on-surface-variant" />
              )}
            </button>
          </div>
          <DialogFooter>
            <Button variant="primary" onClick={() => { setNewKey(null); setShowCreate(false); }}>
              I&apos;ve saved my key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
