"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function BillingAddressSettingsPage() {
  const [address, setAddress] = useState({
    company: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    taxId: "",
  });

  const handleSave = () => {
    toast.success("Billing address saved");
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Billing Address</h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Update your billing details for invoices and tax purposes.
        </p>
      </div>

      <Card className="card-panel">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="company">Company Name</Label>
            <Input id="company" value={address.company} onChange={(e) => setAddress({ ...address, company: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input id="street" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="state">State / Province</Label>
              <Input id="state" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zip">ZIP / Postal Code</Label>
              <Input id="zip" value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="tax">Tax ID (VAT / GST)</Label>
            <Input id="tax" value={address.taxId} onChange={(e) => setAddress({ ...address, taxId: e.target.value })} />
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={handleSave}>Save Address</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
