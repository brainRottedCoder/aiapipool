"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ENDPOINTS } from "@/lib/api-client";
import type { ApiKey } from "@/types/api";

const KEYS_QUERY_KEY = ["api-keys"];

export function useApiKeys() {
  return useQuery<ApiKey[]>({
    queryKey: KEYS_QUERY_KEY,
    queryFn: () => apiClient.get(ENDPOINTS.user.apiKeys),
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiClient.post<{ id: string; raw_key: string; key_prefix: string }>(
        ENDPOINTS.user.apiKeys,
        { name }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS_QUERY_KEY }),
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(ENDPOINTS.user.apiKeyDetail(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS_QUERY_KEY }),
  });
}
