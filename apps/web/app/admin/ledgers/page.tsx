"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, ENDPOINTS } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ScrollText } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { LedgerEntry, PaginatedResponse } from "@/types/api";

export default function AdminLedgersPage() {
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(100);

  const { data: ledger, isLoading } = useQuery<PaginatedResponse<LedgerEntry>>({
    queryKey: ["admin-ledgers", limit, search],
    queryFn: () => {
      const url = new URL(ENDPOINTS.admin.ledgers);
      url.searchParams.set("limit", String(limit));
      if (search) url.searchParams.set("user_id", search);
      return apiClient.get(url.toString());
    },
  });

  const typeColor: Record<string, string> = {
    api_usage: "bg-red-400/10 text-red-400 border-red-400/20",
    topup: "bg-green-400/10 text-green-400 border-green-400/20",
    refund: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    adjustment: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">Usage Ledger</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Immutable financial ledger browser.
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input
            placeholder="Filter by user ID..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="card-panel overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-surface-hover rounded animate-pulse" />
              ))}
            </div>
          ) : ledger && ledger.data.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-subtle/50">
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Type</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Amount</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Balance After</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-subtle/30">
                {ledger.data.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface-hover/50">
                    <td className="p-4">
                      <Badge variant="outline" className={typeColor[entry.type] ?? ""}>
                        {entry.type}
                      </Badge>
                    </td>
                    <td className={`p-4 font-mono text-body-md ${Number(entry.amount) >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {Number(entry.amount) >= 0 ? "+" : ""}${Number(entry.amount).toFixed(4)}
                    </td>
                    <td className="p-4 font-mono text-body-md text-on-surface">
                      ${Number(entry.balance_after).toFixed(4)}
                    </td>
                    <td className="p-4 font-mono text-label-sm text-on-surface-variant">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={ScrollText}
                title="No ledger entries"
                description="The immutable ledger is empty. Usage will create entries automatically."
              />
            </div>
          )}
          {ledger && ledger.total > limit && (
            <div className="p-4 border-t border-outline-subtle/50 flex justify-center">
              <Button
                variant="secondary"
                onClick={() => setLimit((l) => l + 100)}
              >
                Load More ({ledger.total - limit} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
