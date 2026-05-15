import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function AdminLedgersPage() {
  const entries = [
    { id: "1", user: "dev@startup.io", type: "api_usage", amount: "-$0.0031", balance: "$42.50", date: "2024-05-15 10:42:01" },
    { id: "2", user: "ai@enterprise.com", type: "topup", amount: "+$5.00", balance: "$5.00", date: "2024-05-15 09:15:00" },
    { id: "3", user: "freelancer@dev.io", type: "api_usage", amount: "-$0.0012", balance: "$15.80", date: "2024-05-15 08:30:45" },
    { id: "4", user: "team@saas.co", type: "api_usage", amount: "-$0.0080", balance: "$0.50", date: "2024-05-15 07:55:12" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">Usage Ledger</h1>
          <p className="font-sans text-body-md text-on-surface-variant">Immutable financial audit trail. Read-only view.</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input placeholder="Filter by user..." className="pl-10" />
        </div>
      </div>
      <Card className="card-panel overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-subtle/50">
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Date</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">User</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Type</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Amount</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-subtle/30">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-surface-hover/50">
                  <td className="p-4 font-mono text-code-md text-on-surface-variant">{e.date}</td>
                  <td className="p-4 font-sans text-body-md text-on-surface">{e.user}</td>
                  <td className="p-4">
                    <Badge variant={e.type === "topup" ? "success" : "outline"} className="text-xs">
                      {e.type === "topup" ? "TOP-UP" : "USAGE"}
                    </Badge>
                  </td>
                  <td className={`p-4 font-mono text-code-md ${e.amount.startsWith("+") ? "text-green-400" : "text-on-surface"}`}>
                    {e.amount}
                  </td>
                  <td className="p-4 font-mono text-code-md text-on-surface-variant">{e.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
