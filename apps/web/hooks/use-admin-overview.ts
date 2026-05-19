"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApiClient, ADMIN_ENDPOINTS } from "@/lib/admin-api-client";
import type { AdminOverview } from "@/types/api";

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminApiClient.get<AdminOverview>(ADMIN_ENDPOINTS.overview),
    refetchInterval: 60_000,
  });
}
