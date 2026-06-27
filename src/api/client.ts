import type { ApiAuthResponse, ApiEnvelope } from "@/api/types";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSubject,
  saveTokens,
  type AuthScope
} from "@/api/tokenStore";

const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:18081/api/v1"
  : "/api/v1";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/$/, "") ||
  DEFAULT_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  code?: number;
  requestId?: string;
  errors?: unknown;

  constructor(message: string, status: number, code?: number, requestId?: string, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.errors = errors;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  auth?: AuthScope | "none";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  retryOnUnauthorized?: boolean;
}

function isAbsoluteURL(value: string) {
  return /^https?:\/\//i.test(value);
}

function apiURL(path: string) {
  if (isAbsoluteURL(path)) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function urlWithParams(path: string, params?: RequestOptions["params"]) {
  const base = typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const url = new URL(apiURL(path), base);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

async function parseEnvelope<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (!response.ok) {
      throw new ApiError(response.statusText || "请求失败", response.status);
    }
    return (await response.blob()) as T;
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || envelope.code !== 0) {
    throw new ApiError(
      envelope.message || "请求失败",
      response.status,
      envelope.code,
      envelope.request_id,
      envelope.errors
    );
  }
  return envelope.data;
}

async function refreshSession(scope: AuthScope) {
  const refreshToken = getRefreshToken(scope);
  if (!refreshToken) {
    return false;
  }

  const response = await fetch(apiURL("/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!response.ok) {
    clearSession(scope);
    return false;
  }

  const data = await parseEnvelope<ApiAuthResponse>(response);
  if (!data.access_token || !data.refresh_token) {
    clearSession(scope);
    return false;
  }

  saveTokens(scope, data.access_token, data.refresh_token);
  if (scope === "user" && data.user) {
    saveSubject("user", data.user);
  }
  if (scope === "admin" && data.admin) {
    saveSubject("admin", data.admin);
  }
  return true;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const auth = options.auth ?? "none";
  const headers = new Headers(options.headers);
  const body = options.body;

  if (body !== undefined && !isFormData(body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth !== "none") {
    const token = getAccessToken(auth);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(urlWithParams(path, options.params), {
    ...options,
    headers,
    body: body === undefined ? undefined : isFormData(body) ? body : JSON.stringify(body)
  });

  if (response.status === 401 && auth !== "none" && options.retryOnUnauthorized !== false) {
    const refreshed = await refreshSession(auth);
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  return parseEnvelope<T>(response);
}

export async function downloadFile(path: string, filename: string, auth: AuthScope = "admin") {
  const token = getAccessToken(auth);
  const response = await fetch(urlWithParams(path), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  if (!response.ok) {
    throw new ApiError(response.statusText || "下载失败", response.status);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
