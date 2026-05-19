"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ENDPOINTS } from "@/lib/api-client";

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordInput) =>
      apiClient.post<{ success: boolean }>(ENDPOINTS.user.changePassword, body),
  });
}
