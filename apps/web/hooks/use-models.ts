"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ENDPOINTS, unwrapData, type ApiDataResponse } from "@/lib/api-client";
import type { ModelMapping } from "@/types/api";

export function useModels() {
  return useQuery<ModelMapping[]>({
    queryKey: ["models"],
    queryFn: async () => {
      const res = await apiClient.get<ApiDataResponse<ModelMapping[]>>(
        ENDPOINTS.user.models
      );
      return unwrapData(res);
    },
  });
}
