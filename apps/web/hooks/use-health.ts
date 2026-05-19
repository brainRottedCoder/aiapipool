"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ENDPOINTS } from "@/lib/api-client";
import type { ProviderHealth } from "@/types/api";

export function useHealth() {
  return useQuery<ProviderHealth[]>({
    queryKey: ["health"],
    queryFn: () => apiClient.get(ENDPOINTS.admin.healthProviders),
    refetchInterval: 30_000,
  });
}

export function useAdminHealth() {
  return useQuery({
    queryKey: ["admin-health"],
    queryFn: () =>
      Promise.all([
        apiClient.get(ENDPOINTS.admin.healthProviders),
        apiClient.get(ENDPOINTS.admin.healthKeys),
        apiClient.get(ENDPOINTS.admin.healthQueues),
      ]).then(([providers, keys, queues]) => ({ providers, keys, queues })),
    refetchInterval: 30_000,
  });
}
