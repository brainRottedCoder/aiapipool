"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TopUpPage() {
  const [amount, setAmount] = useState(20);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // Call backend to create Stripe checkout session
      const res = await fetch("/api/user/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch {
      toast.error("Failed to initiate checkout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/billing">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-sans text-headline-xl mb-1">Add Credits</h1>
          <p className="font-sans text-body-md text-on-surface-variant">Top up your account balance.</p>
        </div>
      </div>

      <Card className="card-panel max-w-lg">
        <CardContent className="p-8 space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-sans text-headline-lg text-on-surface">Select Amount</h2>
            <p className="font-sans text-body-md text-on-surface-variant mt-2">
              Minimum top-up is $5. Credits are applied instantly.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[10, 20, 50, 100].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`py-3 rounded-lg border font-medium text-body-md transition-colors ${
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
            <span className="text-on-surface-variant font-mono">$</span>
            <input
              type="number"
              min={5}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 bg-[#070708] border border-outline-subtle rounded-lg px-3 py-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-bright"
            />
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={handleCheckout}
            disabled={isLoading || amount < 5}
          >
            {isLoading ? "Redirecting to Stripe..." : `Checkout $${amount}`}
          </Button>

          <div className="flex items-center justify-center gap-2 text-label-sm text-on-surface-variant">
            <Check className="w-3.5 h-3.5 text-green-400" />
            Secure payment via Stripe
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
