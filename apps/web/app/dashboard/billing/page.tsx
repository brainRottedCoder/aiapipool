import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpRight } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">Billing &amp; Balance</h1>
          <p className="font-sans text-body-md text-on-surface-variant">Manage your credits and view transaction history.</p>
        </div>
        <Link href="/dashboard/billing/top-up">
          <Button variant="primary">
            <Plus className="w-4 h-4" />
            Top Up
          </Button>
        </Link>
      </div>

      <Card className="card-panel bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardContent className="p-8 text-center">
          <p className="font-mono text-label-sm text-on-surface-variant mb-2">Current Balance</p>
          <p className="font-sans text-display-lg text-on-surface mb-4">$42.50</p>
          <Link href="/dashboard/billing/top-up">
            <Button variant="primary">Add Credits</Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="card-panel">
        <CardContent className="p-6">
          <h3 className="font-sans text-headline-md mb-4">Transaction History</h3>
          <div className="space-y-2">
            {[
              { type: "api_usage", desc: "gpt-4o request", amount: "-$0.0031", date: "2 min ago", balance: "$42.50" },
              { type: "api_usage", desc: "llama-3.1-70b request", amount: "-$0.0008", date: "5 min ago", balance: "$42.5031" },
              { type: "topup", desc: "Stripe top-up", amount: "+$20.00", date: "3 hours ago", balance: "$42.5039" },
              { type: "api_usage", desc: "claude-3.5-sonnet request", amount: "-$0.0045", date: "5 hours ago", balance: "$22.5039" },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-outline-subtle/30 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={tx.type === "topup" ? "success" : "outline"} className="text-xs">
                      {tx.type === "topup" ? "TOP-UP" : "USAGE"}
                    </Badge>
                    <span className="font-sans text-body-md text-on-surface">{tx.desc}</span>
                  </div>
                  <span className="font-mono text-label-sm text-on-surface-variant mt-1 block">{tx.date}</span>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-code-md ${tx.amount.startsWith("+") ? "text-green-400" : "text-on-surface"}`}>
                    {tx.amount}
                  </p>
                  <p className="font-mono text-label-sm text-on-surface-variant">Balance: {tx.balance}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
