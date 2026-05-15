"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";

const tabs = [
  { label: "Profile", href: "/settings/profile" },
  { label: "Security", href: "/settings/security" },
  { label: "Billing", href: "/settings/billing-address" },
  { label: "Notifications", href: "/settings/notifications" },
];

const notificationOptions = [
  { label: "Balance alerts (&lt;$5)", desc: "Get notified when your balance drops below $5.00", enabled: true },
  { label: "Outage alerts", desc: "Provider outage and failover notifications", enabled: true },
  { label: "Monthly usage report", desc: "Receive a monthly summary of your usage and spending", enabled: false },
  { label: "New model announcements", desc: "Be the first to know when new models are added", enabled: true },
];

export default function NotificationsPage() {
  const pathname = usePathname();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Settings</h1>
      </div>
      <div className="flex gap-8 items-start">
        <nav className="w-48 shrink-0 flex flex-col gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 font-mono text-label-sm transition-colors rounded-r border-l-4",
                pathname === tab.href
                  ? "bg-primary/10 text-primary border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-hover border-transparent"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1 space-y-6">
          <Card className="card-panel">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-outline-subtle/50">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="font-sans text-headline-md">Notification Preferences</h2>
              </div>
              {notificationOptions.map((opt) => (
                <div key={opt.label} className="flex items-center justify-between py-3 border-b border-outline-subtle/30 last:border-0">
                  <div>
                    <h3 className="font-sans text-body-md text-on-surface font-medium">{opt.label}</h3>
                    <p className="font-sans text-body-md text-on-surface-variant mt-0.5">{opt.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={opt.enabled} />
                    <div className="w-9 h-5 bg-surface-hover peer-checked:bg-primary-bright rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
