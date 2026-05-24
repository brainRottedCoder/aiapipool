"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ENDPOINTS, unwrapData, type ApiDataResponse } from "@/lib/api-client";
import { adminApiClient, ADMIN_ENDPOINTS } from "@/lib/admin-api-client";
import type { ProviderHealth } from "@/types/api";

export function useHealth() {
  return useQuery<ProviderHealth[]>({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await apiClient.get<ApiDataResponse<ProviderHealth[]>>(
        ENDPOINTS.admin.healthProviders
      );
      return unwrapData(res);
    },
    refetchInterval: 30_000,
  });
}

export function useAdminHealth() {
  return useQuery({
    queryKey: ["admin-health"],
    queryFn: async () => {
      const [providersRes, keysRes, queuesRes] = await Promise.all([
        adminApiClient.get<ApiDataResponse<unknown[]>>(ADMIN_ENDPOINTS.healthProviders),
        adminApiClient.get<ApiDataResponse<unknown[]>>(ADMIN_ENDPOINTS.healthKeys),
        adminApiClient.get<ApiDataResponse<unknown[]>>(ADMIN_ENDPOINTS.healthQueues),
      ]);
      return {
        providers: unwrapData(providersRes),
        keys: unwrapData(keysRes),
        queues: unwrapData(queuesRes),
      };
    },
    refetchInterval: 30_000,
  });
}
