"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useBalance } from "@/hooks/use-balance";
import { formatCurrency } from "@/lib/utils";

export function BalanceCard() {
  const { balance, isLoading } = useBalance();

  return (
    <Card className="card-panel-hover">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
            Balance
          </span>
          <CreditCard className="w-4 h-4 text-on-surface-variant" />
        </div>
        {isLoading ? (
          <div className="h-8 bg-surface-hover rounded animate-pulse" />
        ) : (
          <p className="font-sans text-headline-lg text-on-surface">
            {formatCurrency(Number(balance))}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Link href="/dashboard/billing/top-up">
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5" />
              Add Credits
            </Button>
          </Link>
          <Link href="/dashboard/billing">
            <Button variant="ghost" size="sm">
              View Billing
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
