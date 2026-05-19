"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, CreditCard, Key, ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ApiKeyCard } from "@/components/dashboard/api-key-card";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { useBalance } from "@/hooks/use-balance";
import { useApiKeys } from "@/hooks/use-api-keys";
import { useUsage } from "@/hooks/use-usage";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { balance } = useBalance();
  const { data: keys } = useApiKeys();
  const { data: usage } = useUsage("day");

  const totalRequests = usage?.reduce((sum, u) => sum + u.requests, 0) ?? 0;
  const totalTokens = usage?.reduce((sum, u) => sum + u.tokens_input + u.tokens_output, 0) ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <Card className="card-panel rounded-xl p-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <h2 className="font-sans text-headline-md mb-2">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
        </h2>
        <p className="font-sans text-body-md text-on-surface-variant mb-4">
          Your infrastructure-grade AI gateway is ready. Follow the steps below to get started.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/api-keys/create">
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5" />
              Create API Key
            </Button>
          </Link>
          <Link href="/dashboard/billing/top-up">
            <Button variant="secondary" size="sm">Add Credits</Button>
          </Link>
          <Link href="/docs/quickstart">
            <Button variant="ghost" size="sm">
              View Docs
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BalanceCard />
        <StatsCard
          label="Requests Today"
          value={formatNumber(totalRequests)}
          icon={Activity}
          trend={"+12% vs yesterday"}
          trendColor="text-primary"
        />
        <StatsCard
          label="Tokens Burned"
          value={totalTokens > 0 ? `${(totalTokens / 1_000_000).toFixed(1)}M` : "0"}
          icon={Zap}
          trend="Across available models"
        />
        <StatsCard
          label="Active Keys"
          value={String(keys?.filter((k) => k.status === "active").length ?? 0)}
          icon={Key}
          trend={`${keys?.filter((k) => k.status === "active").length ?? 0} total`}
        />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UsageChart />
        <RecentActivity />
      </div>

      {/* API Keys + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ApiKeyCard />
        <TransactionList />
      </div>
    </div>
  );
}
