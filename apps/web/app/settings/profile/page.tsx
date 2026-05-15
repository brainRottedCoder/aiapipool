"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Profile", href: "/settings/profile" },
  { label: "Security", href: "/settings/security" },
  { label: "Billing", href: "/settings/billing-address" },
  { label: "Notifications", href: "/settings/notifications" },
];

export default function ProfilePage() {
  const pathname = usePathname();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">Settings</h1>
        <p className="font-sans text-body-md text-on-surface-variant">Manage your account configurations.</p>
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
              <h2 className="font-sans text-headline-md pb-3 border-b border-outline-subtle/50">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Display Name</label>
                  <Input defaultValue="System Architect" />
                </div>
                <div>
                  <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Email</label>
                  <Input defaultValue="architect@softix.dev" readOnly className="opacity-70" />
                  <span className="font-mono text-label-sm text-on-surface-variant mt-1 block">Contact support to change email.</span>
                </div>
                <div className="md:col-span-2">
                  <label className="font-mono text-label-sm text-on-surface-variant block mb-2">Timezone</label>
                  <select className="input-dark w-full">
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>EST (Eastern Standard Time)</option>
                    <option>PST (Pacific Standard Time)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-outline-subtle/50">
                <Button variant="primary">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
