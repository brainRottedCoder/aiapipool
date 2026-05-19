"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ENDPOINTS } from "@/lib/api-client";
import type { UsageStats } from "@/types/api";

export function useUsage(period: "day" | "month" = "day", model?: string) {
  const url = new URL(ENDPOINTS.user.usage);
  url.searchParams.set("period", period);
  if (model) url.searchParams.set("model", model);

  return useQuery<UsageStats[]>({
    queryKey: ["usage", period, model],
    queryFn: () => apiClient.get(url.toString()),
  });
}

export function useUsageDetail(requestId: string) {
  return useQuery({
    queryKey: ["usage-detail", requestId],
    queryFn: () => apiClient.get(ENDPOINTS.user.usageDetail(requestId)),
    enabled: !!requestId,
  });
}
