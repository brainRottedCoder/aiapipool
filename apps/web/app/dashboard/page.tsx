import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, CreditCard, Key, ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const stats = [
    { label: "Balance", value: "$42.50", icon: CreditCard, trend: "+$20.00 today", color: "text-green-400" },
    { label: "Requests Today", value: "1,247", icon: Activity, trend: "+12% vs yesterday", color: "text-primary" },
    { label: "Tokens Burned", value: "3.2M", icon: Zap, trend: "Across 4 models", color: "text-on-surface" },
    { label: "Active Keys", value: "3", icon: Key, trend: "1 used today", color: "text-on-surface" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner for new users */}
      <div className="card-panel rounded-xl p-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <h2 className="font-sans text-headline-md mb-2">Welcome to SAPI</h2>
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
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-panel-hover">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-on-surface-variant" />
              </div>
              <p className="font-sans text-headline-lg text-on-surface">{stat.value}</p>
              <p className="font-mono text-label-sm text-on-surface-variant">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Chart Placeholder */}
      <Card className="card-panel">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans text-headline-md">Token Burn (7 days)</h3>
            <div className="flex gap-2">
              {["7D", "30D", "90D"].map((t) => (
                <Badge key={t} variant={t === "7D" ? "default" : "outline"} className="cursor-pointer text-xs">{t}</Badge>
              ))}
            </div>
          </div>
          <div className="h-[200px] flex items-end gap-1">
            {[65, 45, 78, 56, 90, 72, 85, 60, 88, 92, 75, 68, 55, 82, 70, 95, 88, 75, 62, 80].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/30 hover:bg-primary/50 rounded-t transition-colors"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="card-panel">
        <CardContent className="p-6">
          <h3 className="font-sans text-headline-md mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: "Request to gpt-4o", time: "2 min ago", detail: "1,250 tokens — $0.0031" },
              { action: "Request to llama-3.1-70b", time: "5 min ago", detail: "890 tokens — $0.0008" },
              { action: "API Key 'Development' created", time: "1 hour ago", detail: "" },
              { action: "Top-up +$20.00", time: "3 hours ago", detail: "Balance: $42.50" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-outline-subtle/30 last:border-0">
                <div>
                  <p className="font-sans text-body-md text-on-surface">{item.action}</p>
                  {item.detail && <p className="font-mono text-label-sm text-on-surface-variant mt-0.5">{item.detail}</p>}
                </div>
                <span className="font-mono text-label-sm text-on-surface-variant shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
