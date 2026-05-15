"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

const tabs = [
  { label: "Profile", href: "/settings/profile" },
  { label: "Security", href: "/settings/security" },
  { label: "Billing", href: "/settings/billing-address" },
  { label: "Notifications", href: "/settings/notifications" },
];

export default function SecurityPage() {
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
              <div className="flex justify-between items-center pb-3 border-b border-outline-subtle/50">
                <h2 className="font-sans text-headline-md">Security Settings</h2>
                <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  Needs Attention
                </Badge>
              </div>
              <div className="space-y-4">
                <h3 className="font-mono text-label-sm text-on-surface uppercase tracking-wider">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Current Password</label>
                    <Input type="password" />
                  </div>
                  <div>
                    <label className="font-mono text-label-sm text-on-surface-variant block mb-2">New Password</label>
                    <Input type="password" />
                  </div>
                </div>
                <Button variant="secondary">Update Password</Button>
              </div>
              <hr className="border-outline-subtle/50" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans text-body-md text-on-surface font-medium">Two-Factor Authentication</h3>
                  <p className="font-sans text-body-md text-on-surface-variant mt-1">Add an extra layer of security to your account.</p>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-surface-hover border border-outline-subtle">
                  <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-on-surface-variant" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
