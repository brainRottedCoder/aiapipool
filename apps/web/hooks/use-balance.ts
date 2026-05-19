"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ENDPOINTS } from "@/lib/api-client";

interface MeResponse {
  id: string;
  email: string;
  name: string | null;
  balance: string;
  status: "active" | "suspended";
  role: "user" | "admin";
}

export function useMe() {
  return useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: () => apiClient.get(ENDPOINTS.user.me),
    refetchInterval: 60_000,
  });
}

export function useBalance() {
  const { data: me } = useMe();
  return {
    balance: me?.balance ?? "0.00",
    isLoading: !me,
  };
}
