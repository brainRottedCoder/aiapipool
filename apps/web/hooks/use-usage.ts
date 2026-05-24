"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ENDPOINTS, unwrapData, type ApiDataResponse } from "@/lib/api-client";
import { buildApiUrl } from "@/lib/api-endpoints";
import type { UsageStats } from "@/types/api";

export function useUsage(period: "day" | "month" = "day", model?: string) {
  const url = buildApiUrl(ENDPOINTS.user.usage, { period, model });

  return useQuery<UsageStats[]>({
    queryKey: ["usage", period, model],
    queryFn: async () => {
      const res = await apiClient.get<ApiDataResponse<UsageStats[]>>(url);
      return unwrapData(res);
    },
  });
}

export function useUsageDetail(requestId: string) {
  return useQuery({
    queryKey: ["usage-detail", requestId],
    queryFn: () => apiClient.get(ENDPOINTS.user.usageDetail(requestId)),
    enabled: !!requestId,
  });
}
