"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ENDPOINTS } from "@/lib/api-client";
import type { ModelMapping } from "@/types/api";

export function useModels() {
  return useQuery<ModelMapping[]>({
    queryKey: ["models"],
    queryFn: () => apiClient.get(ENDPOINTS.admin.modelMappings),
  });
}
