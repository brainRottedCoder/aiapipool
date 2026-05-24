"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ENDPOINTS, unwrapData, type ApiDataResponse } from "@/lib/api-client";
import type { ApiKey } from "@/types/api";

const KEYS_QUERY_KEY = ["api-keys"];

export function useApiKeys() {
  return useQuery<ApiKey[]>({
    queryKey: KEYS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiDataResponse<ApiKey[]>>(ENDPOINTS.user.apiKeys);
      return unwrapData(res);
    },
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await apiClient.post<{
        id: string;
        key?: string;
        raw_key?: string;
        key_prefix: string;
      }>(ENDPOINTS.user.apiKeys, { name });
      const raw_key = res.raw_key ?? res.key;
      if (!raw_key) {
        throw new Error("API key was created but the secret was not returned");
      }
      return { id: res.id, raw_key, key_prefix: res.key_prefix };
    },
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
