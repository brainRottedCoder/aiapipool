"use client";

import { useLedger } from "@/hooks/use-ledger";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ScrollText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const typeColor: Record<string, string> = {
  api_usage: "bg-red-400/10 text-red-400 border-red-400/20",
  topup: "bg-green-400/10 text-green-400 border-green-400/20",
  refund: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  adjustment: "bg-primary/10 text-primary border-primary/20",
};

export function TransactionList() {
  const { data: ledger, isLoading } = useLedger(10);

  return (
    <Card className="card-panel">
      <CardContent className="p-6">
        <h3 className="font-sans text-headline-md mb-4">Recent Transactions</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-surface-hover rounded animate-pulse" />
            ))}
          </div>
        ) : ledger && ledger.data.length > 0 ? (
          <div className="space-y-3">
            {ledger.data.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2 border-b border-outline-subtle/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={typeColor[entry.type] ?? ""}
                  >
                    {entry.type}
                  </Badge>
                  <span className="font-mono text-label-sm text-on-surface-variant">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <p
                    className={`font-mono text-body-md ${
                      Number(entry.amount) >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {Number(entry.amount) >= 0 ? "+" : ""}
                    {formatCurrency(Number(entry.amount))}
                  </p>
                  <p className="font-mono text-label-sm text-on-surface-variant">
                    Balance: {formatCurrency(Number(entry.balance_after))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ScrollText}
            title="No transactions yet"
            description="Your billing history will appear here once you start using the API."
          />
        )}
      </CardContent>
    </Card>
  );
}
