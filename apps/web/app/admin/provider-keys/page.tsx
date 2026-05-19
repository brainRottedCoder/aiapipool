"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiClient, ADMIN_ENDPOINTS } from "@/lib/admin-api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Key, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { ProviderKey } from "@/types/api";

export default function AdminProviderKeysPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [newProvider, setNewProvider] = useState("");
  const [newKey, setNewKey] = useState("");
  const qc = useQueryClient();

  const { data: keys, isLoading } = useQuery<ProviderKey[]>({
    queryKey: ["admin-provider-keys"],
    queryFn: () => adminApiClient.get(ADMIN_ENDPOINTS.providerKeys),
  });

  const addKey = useMutation({
    mutationFn: (body: { provider: string; api_key: string }) =>
      adminApiClient.post(ADMIN_ENDPOINTS.providerKeys, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-provider-keys"] });
      toast.success("Provider key added");
      setShowCreate(false);
      setNewProvider("");
      setNewKey("");
    },
    onError: () => toast.error("Failed to add provider key"),
  });

  const rotateKey = useMutation({
    mutationFn: (id: string) => adminApiClient.patch(ADMIN_ENDPOINTS.providerKeyRotate(id), {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-provider-keys"] });
      toast.success("Key rotated");
    },
    onError: () => toast.error("Failed to rotate key"),
  });

  const deleteKey = useMutation({
    mutationFn: (id: string) => adminApiClient.delete(ADMIN_ENDPOINTS.providerKeyDetail(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-provider-keys"] });
      toast.success("Key deleted");
    },
    onError: () => toast.error("Failed to delete key"),
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "success";
      case "EXHAUSTED": return "warning";
      case "ERROR": return "destructive";
      case "ROTATING": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">Provider Key Pool</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Manage upstream provider API keys and credits.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          Add Key
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
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id} className="card-panel-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Key className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans text-headline-md text-on-surface">{key.provider}</h3>
                        <Badge variant={statusColor(key.status)} className="text-xs">{key.status}</Badge>
                        {key.is_emergency_reserve && (
                          <Badge variant="outline" className="text-xs">Emergency</Badge>
                        )}
                      </div>
                      <p className="font-mono text-label-sm text-on-surface-variant mt-1">
                        Remaining: ${Number(key.remaining_credits).toFixed(2)} / ${Number(key.initial_credits).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => rotateKey.mutate(key.id)}
                      disabled={rotateKey.isPending}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Provider Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove the key for {key.provider}. Are you sure?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteKey.mutate(key.id)}
                            className="bg-red-400 hover:bg-red-500"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Key}
          title="No provider keys"
          description="Add your first provider key to start routing requests."
          action={
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              Add Key
            </Button>
          }
        />
      )}

      {/* Create Dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background border border-outline-subtle rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="font-sans text-headline-md">Add Provider Key</h2>
            <div className="space-y-3">
              <div>
                <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Provider</label>
                <Input
                  placeholder="openai, anthropic, groq..."
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                />
              </div>
              <div>
                <label className="font-mono text-label-sm text-on-surface-variant block mb-2">API Key</label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => addKey.mutate({ provider: newProvider, api_key: newKey })}
                disabled={addKey.isPending || !newProvider.trim() || !newKey.trim()}
              >
                {addKey.isPending ? "Adding..." : "Add Key"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
