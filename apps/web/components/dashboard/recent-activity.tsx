"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Activity } from "lucide-react";

interface RecentActivityProps {
  items?: Array<{
    action: string;
    time: string;
    detail?: string;
  }>;
}

export function RecentActivity({ items = [] }: RecentActivityProps) {
  const defaultItems = [
    { action: "Request to gpt-4o", time: "2 min ago", detail: "1,250 tokens — $0.0031" },
    { action: "Request to llama-3.1-70b", time: "5 min ago", detail: "890 tokens — $0.0008" },
    { action: "API Key 'Development' created", time: "1 hour ago", detail: "" },
    { action: "Top-up +$20.00", time: "3 hours ago", detail: "Balance: $42.50" },
  ];

  const displayItems = items.length > 0 ? items : defaultItems;

  return (
    <Card className="card-panel">
      <CardContent className="p-6">
        <h3 className="font-sans text-headline-md mb-4">Recent Activity</h3>
        {displayItems.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No recent activity"
            description="Your recent API requests and billing events will appear here."
          />
        ) : (
          <div className="space-y-3">
            {displayItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-outline-subtle/30 last:border-0"
              >
                <div>
                  <p className="font-sans text-body-md text-on-surface">{item.action}</p>
                  {item.detail && (
                    <p className="font-mono text-label-sm text-on-surface-variant mt-0.5">
                      {item.detail}
                    </p>
                  )}
                </div>
                <span className="font-mono text-label-sm text-on-surface-variant shrink-0">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
