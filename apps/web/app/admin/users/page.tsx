"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApiClient, ADMIN_ENDPOINTS } from "@/lib/admin-api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Ban, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { UserAdmin } from "@/types/api";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await adminApiClient.get<{ data: UserAdmin[] }>(ADMIN_ENDPOINTS.users);
      return res.data;
    },
  });

  const filtered = users?.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuspend = async (id: string) => {
    try {
      await adminApiClient.patch(ADMIN_ENDPOINTS.userSuspend(id), {});
      toast.success("User banned");
      refetch();
    } catch {
      toast.error("Failed to ban user");
    }
  };

  const handleUnsuspend = async (id: string) => {
    try {
      await adminApiClient.patch(ADMIN_ENDPOINTS.userUnsuspend(id), {});
      toast.success("User unbanned");
      refetch();
    } catch {
      toast.error("Failed to unban user");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">User Management</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            {filtered?.length ?? 0} users registered
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input
            placeholder="Search by email..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="card-panel overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-surface-hover rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-subtle/50">
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Email</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Balance</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Status</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Joined</th>
                  <th className="text-right p-4 font-mono text-label-sm text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-subtle/30">
                {filtered?.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-hover/50">
                    <td className="p-4 font-sans text-body-md text-on-surface">{u.email}</td>
                    <td className="p-4 font-mono text-code-md text-on-surface">
                      ${Number(u.balance).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={u.status === "active" ? "success" : "destructive"}
                        className="text-xs"
                      >
                        {u.status}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-code-md text-on-surface-variant">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/users/${u.id}`}>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                        {u.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleSuspend(u.id)}
                            title="Ban user"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-300"
                            onClick={() => handleUnsuspend(u.id)}
                            title="Unban user"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
