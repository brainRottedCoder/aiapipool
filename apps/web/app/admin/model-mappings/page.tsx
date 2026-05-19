"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ENDPOINTS } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ModelMapping } from "@/types/api";

export default function AdminModelMappingsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [alias, setAlias] = useState("");
  const [provider, setProvider] = useState("");
  const [providerModel, setProviderModel] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [outputPrice, setOutputPrice] = useState("");
  const qc = useQueryClient();

  const { data: mappings, isLoading } = useQuery<ModelMapping[]>({
    queryKey: ["admin-model-mappings"],
    queryFn: () => apiClient.get(ENDPOINTS.admin.modelMappings),
  });

  const addMapping = useMutation({
    mutationFn: (body: unknown) => apiClient.post(ENDPOINTS.admin.modelMappings, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-model-mappings"] });
      toast.success("Model mapping added");
      setShowCreate(false);
      setAlias(""); setProvider(""); setProviderModel(""); setInputPrice(""); setOutputPrice("");
    },
    onError: () => toast.error("Failed to add mapping"),
  });

  const deleteMapping = useMutation({
    mutationFn: (id: string) => apiClient.delete(ENDPOINTS.admin.modelMappingDetail(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-model-mappings"] });
      toast.success("Mapping deleted");
    },
    onError: () => toast.error("Failed to delete mapping"),
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">Model Mappings</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Map model aliases to upstream providers.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          Add Mapping
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
      ) : mappings && mappings.length > 0 ? (
        <div className="space-y-3">
          {mappings.map((m) => (
            <Card key={m.id} className="card-panel-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <GitBranch className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans text-headline-md text-on-surface">{m.model_alias}</h3>
                        <Badge variant={m.status === "ACTIVE" ? "success" : "outline"} className="text-xs">
                          {m.status}
                        </Badge>
                      </div>
                      <p className="font-mono text-label-sm text-on-surface-variant mt-1">
                        {m.provider} → {m.provider_model_id} | Input: ${m.pricing_input} /1M | Output: ${m.pricing_output} /1M
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => deleteMapping.mutate(m.id)}
                    disabled={deleteMapping.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={GitBranch}
          title="No model mappings"
          description="Add your first model alias to provider mapping."
          action={
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              Add Mapping
            </Button>
          }
        />
      )}

      {/* Create Dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background border border-outline-subtle rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="font-sans text-headline-md">Add Model Mapping</h2>
            <div className="space-y-3">
              <Input placeholder="Model Alias (e.g., gpt-4o)" value={alias} onChange={(e) => setAlias(e.target.value)} />
              <Input placeholder="Provider (e.g., openai)" value={provider} onChange={(e) => setProvider(e.target.value)} />
              <Input placeholder="Provider Model ID" value={providerModel} onChange={(e) => setProviderModel(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Input Price" value={inputPrice} onChange={(e) => setInputPrice(e.target.value)} />
                <Input type="number" placeholder="Output Price" value={outputPrice} onChange={(e) => setOutputPrice(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() =>
                  addMapping.mutate({
                    model_alias: alias,
                    provider,
                    provider_model_id: providerModel,
                    pricing_input: Number(inputPrice),
                    pricing_output: Number(outputPrice),
                  })
                }
                disabled={addMapping.isPending || !alias.trim() || !provider.trim() || !providerModel.trim()}
              >
                {addMapping.isPending ? "Adding..." : "Add Mapping"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
