import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2 } from "lucide-react";

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Payment Methods</h1>
        <p className="font-sans text-body-md text-on-surface-variant">Manage your saved payment methods.</p>
      </div>
      <Card className="card-panel">
        <CardContent className="p-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded bg-surface flex items-center justify-center border border-outline-subtle">
                <span className="font-mono text-label-sm font-bold text-on-surface">VISA</span>
              </div>
              <div>
                <p className="font-sans text-body-md text-on-surface font-medium">Visa ending in 4242</p>
                <p className="font-mono text-label-sm text-on-surface-variant mt-0.5">Expires 12/2025</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">Default</Badge>
              <Button variant="ghost" size="sm" className="text-on-surface-variant hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Button variant="secondary">
        <Plus className="w-4 h-4" />
        Add Payment Method
      </Button>
    </div>
  );
}
