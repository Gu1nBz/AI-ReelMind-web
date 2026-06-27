import { apiRequest } from "@/api/client";
import type { ApiAuthResponse, ApiEmailCodeResponse } from "@/api/types";

export function sendEmailCode(email: string, scene: "login" | "reset_password") {
  return apiRequest<ApiEmailCodeResponse>("/auth/email-code/send", {
    method: "POST",
    body: { email, scene }
  });
}

export function loginByPassword(email: string, password: string) {
  return apiRequest<ApiAuthResponse>("/auth/login/password", {
    method: "POST",
    body: { email, password }
  });
}

export function loginByCode(email: string, code: string) {
  return apiRequest<ApiAuthResponse>("/auth/login/code", {
    method: "POST",
    body: { email, code }
  });
}

export function requestPasswordReset(email: string) {
  return apiRequest<ApiEmailCodeResponse>("/auth/password/reset/request", {
    method: "POST",
    body: { email }
  });
}

export function confirmPasswordReset(email: string, code: string, password: string) {
  return apiRequest<{ reset: boolean }>("/auth/password/reset/confirm", {
    method: "POST",
    body: { email, code, password }
  });
}

export function logoutUser(refreshToken: string) {
  return apiRequest<{ revoked: boolean }>("/auth/logout", {
    method: "POST",
    auth: "user",
    body: { refresh_token: refreshToken },
    retryOnUnauthorized: false
  });
}

export function logoutAdmin(refreshToken: string) {
  return apiRequest<{ revoked: boolean }>("/admin/auth/logout", {
    method: "POST",
    auth: "admin",
    body: { refresh_token: refreshToken },
    retryOnUnauthorized: false
  });
}
