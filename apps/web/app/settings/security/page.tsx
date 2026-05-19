"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { useState } from "react";

export default function SecuritySettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Security</h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Manage your password and security settings.
        </p>
      </div>

      <Card className="card-panel">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-sans text-headline-md text-on-surface">Change Password</h3>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <Separator />

      <Card className="card-panel">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans text-headline-md text-on-surface">Two-Factor Authentication</h3>
              <p className="font-sans text-body-md text-on-surface-variant mt-1">
                Add an extra layer of security to your account.
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
