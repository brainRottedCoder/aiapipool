"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useModels } from "@/hooks/use-models";
import { EmptyState } from "@/components/shared/empty-state";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Cpu, Search, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function DashboardModelsPage() {
  const { data: models, isLoading, isError } = useModels();
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { copy } = useCopyToClipboard();

  const filtered =
    models?.filter(
      (m) =>
        m.model_alias.toLowerCase().includes(search.toLowerCase()) ||
        m.provider.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const handleCopy = (modelAlias: string) => {
    copy(modelAlias);
    setCopiedId(modelAlias);
    toast.success("Model ID copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">Models</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Available models and their IDs for API requests.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input
            className="pl-10"
            placeholder="Search by model ID, provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="card-panel">
              <CardContent className="p-6">
                <div className="h-16 bg-surface-hover rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Cpu}
          title="Failed to load models"
          description="Could not fetch the model list. Check that the API is running and try again."
        />
      ) : filtered.length > 0 ? (
        <Card className="card-panel">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-subtle/50">
                    <th className="text-left p-3 font-mono text-label-sm text-on-surface-variant">
                      Model ID
                    </th>
                    <th className="text-left p-3 font-mono text-label-sm text-on-surface-variant">
                      Provider
                    </th>
                    <th className="text-left p-3 font-mono text-label-sm text-on-surface-variant">
                      Status
                    </th>
                    <th className="text-left p-3 font-mono text-label-sm text-on-surface-variant">
                      Input / Output ($/1M)
                    </th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-subtle/30">
                  {filtered.map((model) => (
                    <tr key={model.id} className="hover:bg-surface-hover/50">
                      <td className="p-3">
                        <code className="font-mono text-code-md text-on-surface">
                          {model.model_alias}
                        </code>
                        <p className="font-mono text-label-sm text-on-surface-variant mt-1 truncate max-w-xs">
                          {model.id}
                        </p>
                      </td>
                      <td className="p-3 font-sans text-body-md text-on-surface capitalize">
                        {model.provider}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={model.status === "ACTIVE" ? "success" : "outline"}
                          className="text-xs"
                        >
                          {model.status}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-body-md text-on-surface-variant">
                        ${model.pricing_input} / ${model.pricing_output}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleCopy(model.model_alias)}
                          className="p-2 hover:bg-surface-hover rounded transition-colors text-on-surface-variant hover:text-on-surface"
                          title="Copy model ID"
                        >
                          {copiedId === model.model_alias ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={Cpu}
          title={search ? "No models match your search" : "No models available"}
          description={
            search
              ? "Try a different search term."
              : "Active model mappings will appear here once configured."
          }
        />
      )}
    </div>
  );
}
