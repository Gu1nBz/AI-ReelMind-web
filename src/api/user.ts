import { apiRequest } from "@/api/client";
import type {
  ApiCreateTaskResponse,
  ApiCreditTransaction,
  ApiPage,
  ApiPreviewResponse,
  ApiRedeemRecord,
  ApiRedeemResponse,
  ApiUploadedAsset,
  ApiUser,
  ApiVideoTask
} from "@/api/types";

export function getUserMe() {
  return apiRequest<ApiUser>("/user/me", { auth: "user" });
}

export function listUserTransactions(page = 1, pageSize = 20) {
  return apiRequest<ApiPage<ApiCreditTransaction>>("/user/credit-transactions", {
    auth: "user",
    params: { page, page_size: pageSize }
  });
}

export function uploadAsset(file: File, assetType: "image" | "video" | "audio") {
  const formData = new FormData();
  formData.append("asset_type", assetType);
  formData.append("file", file);
  return apiRequest<ApiUploadedAsset>("/user/uploads", {
    method: "POST",
    auth: "user",
    body: formData
  });
}

export function listUserTasks(page = 1, pageSize = 20) {
  return apiRequest<ApiPage<ApiVideoTask>>("/user/tasks", {
    auth: "user",
    params: { page, page_size: pageSize }
  });
}

export function getUserTask(id: string) {
  return apiRequest<ApiVideoTask>(`/user/tasks/${id}`, { auth: "user" });
}

export function createUserTask(payload: {
  model_id: string;
  prompt_mode: "basic" | "advanced";
  prompt: string;
  advanced_prompt_json?: Record<string, unknown>;
  input_types: string[];
  input_assets: Array<{ asset_id: string; asset_type: string; url: string }>;
  aspect_ratio: string;
  resolution: string;
  duration_seconds: number;
  seed?: number;
}) {
  return apiRequest<ApiCreateTaskResponse>("/user/tasks", {
    method: "POST",
    auth: "user",
    body: payload
  });
}

export function getTaskPreview(id: string) {
  return apiRequest<ApiPreviewResponse>(`/user/tasks/${id}/preview`, { auth: "user" });
}

export function getTaskDownload(id: string) {
  return apiRequest<ApiPreviewResponse>(`/user/tasks/${id}/download`, { auth: "user" });
}

export function redeemCode(code: string) {
  return apiRequest<ApiRedeemResponse>("/user/redeem-codes/redeem", {
    method: "POST",
    auth: "user",
    body: { code }
  });
}

export function listRedeemRecords(page = 1, pageSize = 20) {
  return apiRequest<ApiPage<ApiRedeemRecord>>("/user/redeem-codes/records", {
    auth: "user",
    params: { page, page_size: pageSize }
  });
}

