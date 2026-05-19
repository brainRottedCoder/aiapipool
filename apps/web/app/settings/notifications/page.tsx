"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState({
    emailUsageAlerts: true,
    emailBillingAlerts: true,
    emailOutageAlerts: false,
    emailMarketing: false,
    pushAlerts: true,
  });

  const handleSave = () => {
    toast.success("Notification preferences saved");
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Notifications</h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Choose what notifications you receive and how.
        </p>
      </div>

      <Card className="card-panel">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-sans text-headline-md text-on-surface">Email Notifications</h3>
          <div className="space-y-4">
            {[
              { key: "emailUsageAlerts", label: "Usage Alerts", desc: "High token consumption or rate limit warnings" },
              { key: "emailBillingAlerts", label: "Billing Alerts", desc: "Low balance, top-up confirmations, invoices" },
              { key: "emailOutageAlerts", label: "Outage Alerts", desc: "Provider downtime or failover events" },
              { key: "emailMarketing", label: "Product Updates", desc: "New features, models, and announcements" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <Label className="text-body-md font-medium">{item.label}</Label>
                  <p className="text-body-md text-on-surface-variant">{item.desc}</p>
                </div>
                <Switch
                  checked={settings[item.key as keyof typeof settings]}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, [item.key]: v }))}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSave}>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
