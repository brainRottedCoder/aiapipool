"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ENDPOINTS } from "@/lib/api-client";
import type { LedgerEntry, PaginatedResponse } from "@/types/api";

export function useLedger(limit = 100, offset = 0) {
  const url = new URL(ENDPOINTS.user.ledger);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  return useQuery<PaginatedResponse<LedgerEntry>>({
    queryKey: ["ledger", limit, offset],
    queryFn: () => apiClient.get(url.toString()),
  });
}
