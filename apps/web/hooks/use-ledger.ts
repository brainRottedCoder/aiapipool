"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ENDPOINTS } from "@/lib/api-client";
import { buildApiUrl } from "@/lib/api-endpoints";
import type { LedgerListResponse } from "@/types/api";

export function useLedger(limit = 100, offset = 0) {
  const url = buildApiUrl(ENDPOINTS.user.ledger, { limit, offset });

  return useQuery<LedgerListResponse>({
    queryKey: ["ledger", limit, offset],
    queryFn: () => apiClient.get<LedgerListResponse>(url),
  });
}
