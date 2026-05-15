import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Ban, CheckCircle } from "lucide-react";

export default function AdminUsersPage() {
  const users = [
    { id: "1", email: "dev@startup.io", balance: "$42.50", status: "active", requests: "12.8k", joined: "2024-03-15" },
    { id: "2", email: "ai@enterprise.com", balance: "$1.20", status: "active", requests: "847", joined: "2024-05-01" },
    { id: "3", email: "student@university.edu", balance: "$0.00", status: "suspended", requests: "320", joined: "2024-04-20" },
    { id: "4", email: "freelancer@dev.io", balance: "$15.80", status: "active", requests: "2.4k", joined: "2024-02-10" },
    { id: "5", email: "team@saas.co", balance: "$0.50", status: "active", requests: "34.2k", joined: "2024-01-05" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">User Management</h1>
          <p className="font-sans text-body-md text-on-surface-variant">{users.length} users registered</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input placeholder="Search by email..." className="pl-10" />
        </div>
      </div>
      <Card className="card-panel overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-subtle/50">
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Email</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Balance</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Status</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Requests</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Joined</th>
                <th className="text-right p-4 font-mono text-label-sm text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-subtle/30">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-hover/50">
                  <td className="p-4 font-sans text-body-md text-on-surface">{u.email}</td>
                  <td className="p-4 font-mono text-code-md text-on-surface">{u.balance}</td>
                  <td className="p-4">
                    <Badge variant={u.status === "active" ? "success" : "destructive"} className="text-xs">{u.status}</Badge>
                  </td>
                  <td className="p-4 font-mono text-code-md text-on-surface-variant">{u.requests}</td>
                  <td className="p-4 font-mono text-code-md text-on-surface-variant">{u.joined}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.status === "active" ? (
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300"><Ban className="w-4 h-4" /></Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300"><CheckCircle className="w-4 h-4" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
