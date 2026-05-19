"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiClient, ENDPOINTS } from "@/lib/api-client";
import { EmptyState } from "@/components/shared/empty-state";
import { ArrowLeft, User, Ban, CheckCircle, Mail, Calendar, DollarSign, Activity } from "lucide-react";
import type { UserAdmin } from "@/types/api";

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";

  const { data: user, isLoading } = useQuery<UserAdmin>({
    queryKey: ["admin-user", id],
    queryFn: () => apiClient.get(`${ENDPOINTS.admin.users}/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-surface-hover rounded animate-pulse w-48" />
        <Card className="card-panel">
          <CardContent className="p-6">
            <div className="h-48 bg-surface-hover rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <EmptyState
          icon={User}
          title="User not found"
          description="The requested user could not be found."
          action={
            <Link href="/admin/users">
              <Button variant="primary">Back to Users</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-sans text-headline-xl mb-1">{user.name ?? user.email}</h1>
          <p className="font-sans text-body-md text-on-surface-variant font-mono">{user.email}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant={user.status === "active" ? "success" : "destructive"} className="text-xs">
            {user.status}
          </Badge>
          <Badge variant={user.role === "admin" ? "default" : "outline"} className="text-xs">
            {user.role}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Balance</p>
            <p className="font-sans text-headline-lg text-on-surface">${Number(user.balance).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Status</p>
            <div className="flex items-center gap-2">
              {user.status === "active" ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Ban className="w-5 h-5 text-red-400" />
              )}
              <span className="font-sans text-headline-lg text-on-surface capitalize">{user.status}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Role</p>
            <p className="font-sans text-headline-lg text-on-surface capitalize">{user.role}</p>
          </CardContent>
        </Card>
        <Card className="card-panel">
          <CardContent className="p-5 space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase">Joined</p>
            <p className="font-sans text-headline-lg text-on-surface">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-panel">
        <CardContent className="p-6">
          <h3 className="font-sans text-headline-md mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            User Activity
          </h3>
          <EmptyState
            icon={Activity}
            title="Activity data unavailable"
            description="User request logs will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}
