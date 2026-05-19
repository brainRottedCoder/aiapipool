"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/billing">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-sans text-headline-xl mb-1">Payment Methods</h1>
          <p className="font-sans text-body-md text-on-surface-variant">Manage your saved cards.</p>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="card-panel">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-sans text-body-lg font-medium text-on-surface">•••• •••• •••• 4242</p>
                <p className="font-mono text-label-sm text-on-surface-variant">Expires 12/25</p>
              </div>
            </div>
            <Badge variant="success" className="text-xs">Default</Badge>
          </CardContent>
        </Card>

        <Button variant="secondary" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add New Card
        </Button>
      </div>
    </div>
  );
}
