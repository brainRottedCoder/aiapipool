"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ban, CheckCircle } from "lucide-react";
import { use } from "react";

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="space-y-8">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="font-mono text-label-sm">Back to Users</span>
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">User: dev@startup.io</h1>
          <p className="font-mono text-code-md text-on-surface-variant">ID: {id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm"><Ban className="w-4 h-4" /> Suspend</Button>
          <Button variant="outline" size="sm"><CheckCircle className="w-4 h-4" /> Unsuspend</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Balance", value: "$42.50" },
          { label: "Status", value: "active", badge: "success" },
          { label: "Total Requests", value: "12,847" },
          { label: "Joined", value: "2024-03-15" },
        ].map((s) => (
          <Card key={s.label} className="card-panel">
            <CardContent className="p-5 space-y-2">
              <p className="font-mono text-label-sm text-on-surface-variant">{s.label}</p>
              {s.badge ? <Badge variant="success" className="text-xs">{s.value}</Badge> : <p className="font-sans text-headline-md text-on-surface">{s.value}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
