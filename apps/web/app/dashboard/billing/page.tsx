"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useBalance } from "@/hooks/use-balance";
import { useLedger } from "@/hooks/use-ledger";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { Plus, ArrowRight, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function BillingPage() {
  const { balance } = useBalance();
  const [amount, setAmount] = useState(20);

  const handleTopUp = async () => {
    try {
      // This would normally call the backend to create a Stripe checkout session
      toast.info(`Stripe checkout for $${amount} would open here.`);
    } catch {
      toast.error("Failed to initiate checkout");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Billing & Balance</h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Manage your credits and view transaction history.
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-panel md:col-span-2">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
                Current Balance
              </p>
              <p className="font-sans text-display-lg text-on-surface">
                {formatCurrency(Number(balance))}
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <Link href="/dashboard/billing/top-up">
                <Button variant="primary">
                  <Plus className="w-4 h-4" />
                  Add Credits
                </Button>
              </Link>
              <Link href="/dashboard/billing/payment-methods">
                <Button variant="secondary">Payment Methods</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="card-panel">
          <CardContent className="p-6">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider mb-4">
              Quick Top-Up
            </p>
            <div className="space-y-3">
              <div className="flex gap-2">
                {[10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`flex-1 py-2 rounded-lg border text-body-md font-medium transition-colors ${
                      amount === amt
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-outline-subtle text-on-surface-variant hover:border-primary/50"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant">$</span>
                <Input
                  type="number"
                  min={5}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <Button variant="primary" className="w-full" onClick={handleTopUp}>
                <CreditCard className="w-4 h-4" />
                Checkout ${amount}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <TransactionList />
    </div>
  );
}
