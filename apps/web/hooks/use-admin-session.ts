"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminApiClient,
  ADMIN_ENDPOINTS,
  setAdminSessionToken,
  clearAdminSessionToken,
} from "@/lib/admin-api-client";
import { useRouter } from "next/navigation";

export interface AdminProfile {
  id: string;
  email: string;
  name: string | null;
}

export function useAdminSession() {
  return useQuery({
    queryKey: ["admin-session"],
    queryFn: async () => {
      const res = await adminApiClient.get<{ admin: AdminProfile }>(ADMIN_ENDPOINTS.authMe);
      return res.admin;
    },
    retry: false,
  });
}

export function useAdminLogin() {
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const res = await adminApiClient.post<{
        token: string;
        admin: AdminProfile;
      }>(ADMIN_ENDPOINTS.authLogin, body);
      setAdminSessionToken(res.token);
      return res.admin;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-session"] });
      router.push("/admin");
      router.refresh();
    },
  });
}

export function useAdminLogout() {
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await adminApiClient.post(ADMIN_ENDPOINTS.authLogout, {});
      } finally {
        clearAdminSessionToken();
      }
    },
    onSuccess: () => {
      qc.clear();
      router.push("/admin/login");
      router.refresh();
    },
  });
}
