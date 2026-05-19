import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, User, Shield, Bell, CreditCard, ChevronRight } from "lucide-react";

const sections = [
  { title: "Profile", description: "Update your display name and public info", icon: User, href: "/settings/profile" },
  { title: "Security", description: "Change password, enable 2FA, manage sessions", icon: Shield, href: "/settings/security" },
  { title: "Notifications", description: "Email and push notification preferences", icon: Bell, href: "/settings/notifications" },
  { title: "Billing Address", description: "Invoice details and tax information", icon: CreditCard, href: "/settings/billing-address" },
];

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Settings</h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Manage your account preferences and security.
        </p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="block">
            <Card className="card-panel-hover group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-sans text-body-lg font-medium text-on-surface group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="font-sans text-body-md text-on-surface-variant">{section.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-on-surface transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
