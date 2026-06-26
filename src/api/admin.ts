import { apiRequest, downloadFile } from "@/api/client";
import type {
  ApiCreditPackage,
  ApiCreditTransaction,
  ApiOverview,
  ApiPage,
  ApiPromptField,
  ApiProvider,
  ApiProviderMappings,
  ApiRedeemCode,
  ApiUser,
  ApiVideoModel,
  ApiVideoTask
} from "@/api/types";

export function getAdminMe() {
  return apiRequest<{ id: string; role: string; email: string }>("/admin/auth/me", { auth: "admin" });
}

export function getOverview() {
  return apiRequest<ApiOverview>("/admin/overview", { auth: "admin" });
}

export function listAdminModels() {
  return apiRequest<{ list: ApiVideoModel[] }>("/admin/models", { auth: "admin" });
}

export function createAdminModel(payload: Partial<ApiVideoModel>) {
  return apiRequest<ApiVideoModel>("/admin/models", { method: "POST", auth: "admin", body: payload });
}

export function updateAdminModel(id: string, payload: Partial<ApiVideoModel>) {
  return apiRequest<ApiVideoModel>(`/admin/models/${id}`, { method: "PATCH", auth: "admin", body: payload });
}

export function updateAdminModelStatus(id: string, status: string) {
  return apiRequest<ApiVideoModel>(`/admin/models/${id}/status`, {
    method: "PATCH",
    auth: "admin",
    body: { status }
  });
}

export function listProviders() {
  return apiRequest<{ list: ApiProvider[] }>("/admin/providers", { auth: "admin" });
}

export function createProvider(payload: Record<string, unknown>) {
  return apiRequest<ApiProvider>("/admin/providers", { method: "POST", auth: "admin", body: payload });
}

export function updateProvider(id: string, payload: Record<string, unknown>) {
  return apiRequest<ApiProvider>(`/admin/providers/${id}`, { method: "PATCH", auth: "admin", body: payload });
}

export function updateProviderStatus(id: string, status: string) {
  return apiRequest<ApiProvider>(`/admin/providers/${id}/status`, {
    method: "PATCH",
    auth: "admin",
    body: { status }
  });
}

export function providerHealthCheck(id: string) {
  return apiRequest<{ healthy: boolean; checked_at: string; message: string }>(`/admin/providers/${id}/health-check`, {
    method: "POST",
    auth: "admin"
  });
}

export function getProviderMappings(id: string) {
  return apiRequest<ApiProviderMappings>(`/admin/providers/${id}/mappings`, { auth: "admin" });
}

export function updateProviderMappings(id: string, payload: Omit<ApiProviderMappings, "provider_id" | "adapter_key">) {
  return apiRequest<ApiProviderMappings>(`/admin/providers/${id}/mappings`, {
    method: "PUT",
    auth: "admin",
    body: payload
  });
}

export function listPromptFields() {
  return apiRequest<{ list: ApiPromptField[] }>("/admin/prompt-fields", { auth: "admin" });
}

export function createPromptField(payload: Partial<ApiPromptField>) {
  return apiRequest<ApiPromptField>("/admin/prompt-fields", { method: "POST", auth: "admin", body: payload });
}

export function updatePromptField(id: string, payload: Partial<ApiPromptField>) {
  return apiRequest<ApiPromptField>(`/admin/prompt-fields/${id}`, { method: "PATCH", auth: "admin", body: payload });
}

export function updatePromptFieldStatus(id: string, isEnabled: boolean) {
  return apiRequest<ApiPromptField>(`/admin/prompt-fields/${id}/status`, {
    method: "PATCH",
    auth: "admin",
    body: { is_enabled: isEnabled }
  });
}

export function listAdminPackages() {
  return apiRequest<{ list: ApiCreditPackage[] }>("/admin/packages", { auth: "admin" });
}

export function createPackage(payload: Partial<ApiCreditPackage>) {
  return apiRequest<ApiCreditPackage>("/admin/packages", { method: "POST", auth: "admin", body: payload });
}

export function updatePackage(id: string, payload: Partial<ApiCreditPackage>) {
  return apiRequest<ApiCreditPackage>(`/admin/packages/${id}`, { method: "PATCH", auth: "admin", body: payload });
}

export function updatePackageStatus(id: string, status: string) {
  return apiRequest<ApiCreditPackage>(`/admin/packages/${id}/status`, {
    method: "PATCH",
    auth: "admin",
    body: { status }
  });
}

export function listRedeemCodes(page = 1, pageSize = 20) {
  return apiRequest<ApiPage<ApiRedeemCode>>("/admin/redeem-codes", {
    auth: "admin",
    params: { page, page_size: pageSize }
  });
}

export function createRedeemCode(payload: Record<string, unknown>) {
  return apiRequest<ApiRedeemCode>("/admin/redeem-codes", { method: "POST", auth: "admin", body: payload });
}

export function batchCreateRedeemCodes(payload: Record<string, unknown>) {
  return apiRequest<{ batch_no: string; generated_count: number }>("/admin/redeem-codes/batch", {
    method: "POST",
    auth: "admin",
    body: payload
  });
}

export function updateRedeemCode(id: string, payload: Record<string, unknown>) {
  return apiRequest<ApiRedeemCode>(`/admin/redeem-codes/${id}`, { method: "PATCH", auth: "admin", body: payload });
}

export function disableRedeemCode(id: string) {
  return apiRequest<ApiRedeemCode>(`/admin/redeem-codes/${id}/disable`, { method: "PATCH", auth: "admin" });
}

export function exportRedeemCodes() {
  return downloadFile("/admin/redeem-code-exports", "redeem-codes.csv", "admin");
}

export function listAdminUsers(page = 1, pageSize = 20) {
  return apiRequest<ApiPage<ApiUser>>("/admin/users", {
    auth: "admin",
    params: { page, page_size: pageSize }
  });
}

export function createCompensationCode(userId: string, payload: Record<string, unknown>) {
  return apiRequest<ApiRedeemCode>(`/admin/users/${userId}/redeem-codes`, {
    method: "POST",
    auth: "admin",
    body: payload
  });
}

export function listAdminTasks(page = 1, pageSize = 20) {
  return apiRequest<ApiPage<ApiVideoTask>>("/admin/tasks", {
    auth: "admin",
    params: { page, page_size: pageSize }
  });
}

export function markTaskFailed(id: string, reason: string) {
  return apiRequest<ApiVideoTask>(`/admin/tasks/${id}/mark-failed`, {
    method: "POST",
    auth: "admin",
    body: { reason }
  });
}

export function refundTask(id: string, reason: string) {
  return apiRequest<ApiVideoTask>(`/admin/tasks/${id}/refund`, {
    method: "POST",
    auth: "admin",
    body: { reason }
  });
}

export function listAdminTransactions(page = 1, pageSize = 20) {
  return apiRequest<ApiPage<ApiCreditTransaction>>("/admin/credit-transactions", {
    auth: "admin",
    params: { page, page_size: pageSize }
  });
}

