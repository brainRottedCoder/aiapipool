"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const amounts = [5, 10, 25, 50, 100];

export default function TopUpPage() {
  return (
    <div className="space-y-8">
      <Link href="/dashboard/billing" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="font-mono text-label-sm">Back to Billing</span>
      </Link>
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Top Up Balance</h1>
        <p className="font-sans text-body-md text-on-surface-variant">Add credits to your account. Minimum top-up is $5.00.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {amounts.map((a) => (
          <Card key={a} className="card-panel-hover text-center p-6 cursor-pointer hover:border-primary">
            <CardContent className="p-0 space-y-2">
              <CreditCard className="w-6 h-6 text-primary mx-auto" />
              <p className="font-sans text-headline-lg text-on-surface">${a}</p>
              <p className="font-mono text-label-sm text-on-surface-variant">USD</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="card-panel rounded-xl p-6">
        <p className="font-sans text-body-md text-on-surface-variant mb-4">
          You will be redirected to Stripe Checkout to complete your payment securely.
        </p>
        <Button variant="primary" size="lg" className="w-full md:w-auto">
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
