"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApiClient, ADMIN_ENDPOINTS } from "@/lib/admin-api-client";
import type { AdminActivityFeed } from "@/types/api";

export function useAdminActivity(limit = 50) {
  return useQuery({
    queryKey: ["admin-activity", limit],
    queryFn: () => {
      const url = new URL(ADMIN_ENDPOINTS.activity);
      url.searchParams.set("limit", String(limit));
      return adminApiClient.get<AdminActivityFeed>(url.toString());
    },
    refetchInterval: 30_000,
  });
}
