import type {
  ApiCreditPackage,
  ApiCreditTransaction,
  ApiPromptField,
  ApiRedeemCode,
  ApiRedeemRecord,
  ApiUploadedAsset,
  ApiUser,
  ApiVideoModel,
  ApiVideoTask
} from "@/api/types";
import type {
  AdvancedPromptField,
  CreditPackage,
  GenerationTask,
  RedeemCodeRecord,
  TransactionRecord,
  UserProfile,
  VideoModel
} from "@/types/domain";

const inputLabels: Record<string, string> = {
  text: "文本",
  image: "图片",
  video: "视频",
  audio: "音频"
};

export function toVideoModel(item: ApiVideoModel): VideoModel {
  const price =
    item.billing_type === "per_second"
      ? item.price_per_second ?? 0
      : item.price_per_generation ?? 0;

  return {
    id: item.id,
    name: item.name,
    provider: item.provider_name,
    badge: item.badge || item.model_key,
    description: item.description,
    status: item.status,
    billingType: item.billing_type,
    price,
    aspectRatios: item.aspect_ratio_options ?? [],
    resolutions: item.supported_resolutions ?? [],
    durations: item.duration_options ?? [],
    defaultDuration: item.default_duration_seconds,
    inputCapabilities: (item.supported_input_types ?? []).map((key) => ({
      key,
      label: inputLabels[key] ?? key,
      required: key === "text"
    })),
    highlights: [item.model_key, item.provider_name, item.badge].filter(Boolean)
  };
}

export function toPromptField(item: ApiPromptField): AdvancedPromptField {
  return {
    key: item.field_key,
    label: item.label,
    description: item.description,
    placeholder: item.placeholder,
    type: item.control_type === "textarea" ? "textarea" : item.control_type === "input" ? "input" : "select",
    options: (item.options ?? []).map((option) => {
      if (typeof option === "string") {
        return option;
      }
      return String(option.label ?? option.value ?? "");
    }).filter(Boolean),
    required: item.is_required
  };
}

export function toCreditPackage(item: ApiCreditPackage): CreditPackage {
  return {
    id: item.id,
    title: item.title,
    credits: item.credits,
    priceLabel: item.price_label,
    recommended: item.is_recommended,
    description: item.description,
    features: [`${item.credits} 积分`, item.payment_provider || "外链支付", item.status === "visible" ? "可购买" : "已隐藏"],
    paymentProvider: item.payment_provider,
    paymentUrl: item.payment_url,
    buttonText: item.button_text || "去支付",
    status: item.status,
    sortOrder: item.sort_order
  };
}

export function toUserProfile(item: ApiUser): UserProfile {
  return {
    name: item.email.split("@")[0],
    email: item.email,
    credits: item.credit_balance,
    rechargeCredits: item.total_recharge_credits,
    consumedCredits: item.total_consumed_credits,
    memberSince: formatDateTime(item.member_since)
  };
}

export function toGenerationTask(item: ApiVideoTask, modelMap: Map<string, string> = new Map()): GenerationTask {
  const assetCover = item.input_assets?.find((asset) => asset.url)?.url ?? "";
  return {
    id: item.id,
    createdAt: formatDateTime(item.created_at),
    modelName: modelMap.get(item.model_id) ?? item.model_id.slice(0, 8),
    prompt: item.prompt,
    promptMode: item.prompt_mode,
    inputTypes: item.input_types ?? [],
    aspectRatio: item.aspect_ratio,
    resolution: item.resolution,
    duration: item.duration_seconds,
    cost: item.credit_cost,
    status: item.status,
    thumbnail: item.cover_url || assetCover,
    videoUrl: item.video_url,
    coverUrl: item.cover_url,
    errorMessage: item.error_message
  };
}

export function toTransaction(item: ApiCreditTransaction): TransactionRecord {
  return {
    id: item.id,
    type: item.transaction_type,
    amount: item.change_amount,
    balanceAfter: item.balance_after,
    note: item.note,
    createdAt: formatDateTime(item.created_at)
  };
}

export function toRedeemRecord(item: ApiRedeemRecord): RedeemCodeRecord {
  return {
    id: item.id,
    code: item.code_masked,
    credits: item.credits,
    batchNo: item.transaction_id,
    channel: item.channel,
    status: "used",
    usedAt: formatDateTime(item.redeemed_at)
  };
}

export function toAdminRedeemCode(item: ApiRedeemCode): RedeemCodeRecord {
  return {
    id: item.id,
    code: item.code,
    credits: item.credits,
    batchNo: item.batch_no,
    channel: item.channel,
    status: item.status,
    usedBy: item.used_by,
    usedAt: formatDateTime(item.used_at),
    expiresAt: formatDateTime(item.expires_at)
  };
}

export function assetToInputAsset(asset: ApiUploadedAsset) {
  return {
    asset_id: asset.asset_id,
    asset_type: asset.asset_type,
    url: asset.url
  };
}

export function formatDateTime(value?: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
