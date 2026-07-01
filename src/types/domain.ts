import type { ReactNode } from "react";

export type ModelStatus = "available" | "maintenance" | "coming_soon" | "disabled";
export type BillingType = "per_second" | "per_generation";
export type PromptMode = "basic" | "advanced";
export type TaskStatus =
  | "pending"
  | "submitted"
  | "processing"
  | "succeeded"
  | "failed"
  | "timed_out"
  | "refunded";

export interface NavItem {
  key: string;
  label: string;
  path: string;
}

export interface InputCapability {
  key: "text" | "image" | "video" | "audio";
  label: string;
  required?: boolean;
}

export interface AdvancedPromptField {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  type: "input" | "textarea" | "select";
  options?: string[];
  required?: boolean;
}

export interface VideoModel {
  id: string;
  name: string;
  provider: string;
  badge: string;
  description: string;
  status: ModelStatus;
  billingType: BillingType;
  price: number;
  aspectRatios: string[];
  resolutions: string[];
  durations: number[];
  defaultDuration?: number;
  inputCapabilities: InputCapability[];
  highlights: string[];
}

export interface ImageModel {
  id: string;
  name: string;
  provider: string;
  badge: string;
  description: string;
  status: ModelStatus;
  pricePerImage: number;
  maxN: number;
  aspectRatios: string[];
  sizes: string[];
  inputCapabilities: InputCapability[];
  capabilities: Record<string, unknown>;
  highlights: string[];
}

export interface DemoComparison {
  id: string;
  title: string;
  subtitle: string;
  sourceLabel: string;
  resultLabel: string;
  sourceImage: string;
  resultImage: string;
}

export interface CreditPackage {
  id: string;
  title: string;
  credits: number;
  priceLabel: string;
  recommended?: boolean;
  description: string;
  features: string[];
  paymentProvider: string;
  paymentUrl?: string;
  buttonText?: string;
  status?: "visible" | "hidden";
  sortOrder?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  credits: number;
  rechargeCredits: number;
  consumedCredits: number;
  memberSince: string;
}

export interface GenerationTask {
  id: string;
  taskType?: "video" | "image";
  createdAt: string;
  modelName: string;
  prompt: string;
  promptMode: PromptMode;
  inputTypes: string[];
  aspectRatio: string;
  resolution: string;
  duration?: number;
  imageCount?: number;
  cost: number;
  status: TaskStatus;
  thumbnail: string;
  videoUrl?: string;
  coverUrl?: string;
  imageUrls?: string[];
  thumbnailUrls?: string[];
  errorMessage?: string;
}

export interface TransactionRecord {
  id: string;
  type: "redeem" | "generation" | "refund";
  amount: number;
  balanceAfter: number;
  note: string;
  createdAt: string;
}

export interface RedeemCodeRecord {
  id: string;
  code: string;
  credits: number;
  batchNo: string;
  channel: string;
  status: "unused" | "used" | "disabled";
  usedBy?: string;
  usedAt?: string;
  expiresAt?: string;
}

export interface AdminStat {
  title: string;
  value: string;
  delta: string;
  icon: ReactNode;
}

export interface ProviderMapping {
  id: string;
  name: string;
  adapterKey: string;
  updateMode: "callback" | "polling" | "both";
  status: "enabled" | "disabled";
  endpoint: string;
  lastCheckAt: string;
}

export interface UserRow {
  id: string;
  email: string;
  credits: number;
  totalRecharge: number;
  totalConsumed: number;
  lastLogin: string;
  registeredAt: string;
}
