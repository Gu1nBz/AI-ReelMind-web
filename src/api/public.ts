import { apiRequest } from "@/api/client";
import type {
  ApiCreditPackage,
  ApiEstimateResponse,
  ApiImageModel,
  ApiPromptField,
  ApiVideoModel
} from "@/api/types";

export function listPublicModels() {
  return apiRequest<{ list: ApiVideoModel[] }>("/public/models");
}

export function listPublicImageModels() {
  return apiRequest<{ list: ApiImageModel[] }>("/public/image-models");
}

export function listPublicPackages() {
  return apiRequest<{ list: ApiCreditPackage[] }>("/public/packages");
}

export function listPublicPromptFields() {
  return apiRequest<{ list: ApiPromptField[] }>("/public/prompt-fields");
}

export function estimateGeneration(payload: {
  model_id: string;
  prompt_mode: string;
  input_types: string[];
  aspect_ratio: string;
  resolution: string;
  duration_seconds: number;
}) {
  return apiRequest<ApiEstimateResponse>("/public/generation/estimate", {
    method: "POST",
    body: payload
  });
}

export function estimateImageGeneration(payload: {
  model_id: string;
  input_types: string[];
  aspect_ratio: string;
  size: string;
  n: number;
}) {
  return apiRequest<ApiEstimateResponse>("/public/image-generation/estimate", {
    method: "POST",
    body: payload
  });
}
