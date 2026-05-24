"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApiClient, ADMIN_ENDPOINTS } from "@/lib/admin-api-client";
import { buildApiUrl } from "@/lib/api-endpoints";
import type { AdminActivityFeed } from "@/types/api";

export function useAdminActivity(limit = 50) {
  return useQuery({
    queryKey: ["admin-activity", limit],
    queryFn: () => {
      const url = buildApiUrl(ADMIN_ENDPOINTS.activity, { limit });
      return adminApiClient.get<AdminActivityFeed>(url);
    },
    refetchInterval: 30_000,
  });
}
