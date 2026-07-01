export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
  request_id?: string;
  errors?: unknown;
}

export interface ApiPagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface ApiPage<T> {
  list: T[];
  pagination: ApiPagination;
}

export interface ApiUser {
  id: string;
  email: string;
  credit_balance: number;
  total_recharge_credits: number;
  total_consumed_credits: number;
  member_since: string;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiAdmin {
  id: string;
  email: string;
  role: string;
  status?: string;
}

export interface ApiAuthResponse {
  access_token: string;
  refresh_token: string;
  admin_access_token?: string;
  admin_refresh_token?: string;
  user?: ApiUser;
  admin?: ApiAdmin;
}

export interface ApiEmailCodeResponse {
  email: string;
  scene: string;
  expires_at: string;
  debug_code?: string;
  sent?: boolean;
}

export interface ApiVideoModel {
  id: string;
  name: string;
  provider_name: string;
  model_key: string;
  description: string;
  badge: string;
  status: "available" | "maintenance" | "coming_soon" | "disabled";
  billing_type: "per_second" | "per_generation";
  price_per_second?: number;
  price_per_generation?: number;
  duration_options: number[];
  default_duration_seconds?: number;
  supported_input_types: Array<"text" | "image" | "video" | "audio">;
  supported_input_combinations: string[][];
  input_asset_rules: Record<string, unknown>;
  aspect_ratio_options: string[];
  supported_resolutions: string[];
  resolution_price_rules: Record<string, unknown>;
  input_price_rules: Record<string, unknown>;
  upstream_provider_id?: string;
  upstream_model_id?: string;
  upstream_default_params?: Record<string, unknown>;
  upstream_param_mapping?: Record<string, unknown>;
  is_visible?: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiImageModel {
  id: string;
  name: string;
  provider_name: string;
  model_key: string;
  description: string;
  badge: string;
  status: "available" | "maintenance" | "coming_soon" | "disabled";
  price_per_image: number;
  max_n: number;
  supported_input_types: Array<"text" | "image">;
  supported_input_combinations: string[][];
  input_asset_rules: Record<string, unknown>;
  aspect_ratio_options: string[];
  supported_sizes: string[];
  capabilities: Record<string, unknown>;
  upstream_provider_id?: string;
  upstream_model_id?: string;
  upstream_default_params?: Record<string, unknown>;
  upstream_param_mapping?: Record<string, unknown>;
  is_visible?: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiPromptField {
  id: string;
  field_key: string;
  label: string;
  description: string;
  placeholder: string;
  control_type: "input" | "textarea" | "select" | "combobox";
  options: Array<string | { label?: string; value?: string; [key: string]: unknown }>;
  allow_custom_value: boolean;
  is_required: boolean;
  is_enabled: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiCreditPackage {
  id: string;
  title: string;
  description: string;
  credits: number;
  price_label: string;
  payment_provider: string;
  payment_url: string;
  button_text: string;
  is_recommended: boolean;
  status: "visible" | "hidden";
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiEstimateResponse {
  credit_cost: number;
  billing_type: string;
  billing_detail: Record<string, unknown>;
}

export interface ApiUploadedAsset {
  asset_id: string;
  asset_type: "image" | "video" | "audio";
  file_name: string;
  file_size: number;
  mime_type: string;
  url: string;
  expires_at?: string;
  bucket_name?: string;
  object_key?: string;
  created_at?: string;
}

export interface ApiVideoTask {
  id: string;
  user_id: string;
  model_id: string;
  prompt: string;
  prompt_mode: "basic" | "advanced";
  advanced_prompt_json: Record<string, unknown>;
  input_types: string[];
  input_assets: Array<{
    asset_id?: string;
    asset_type?: string;
    url?: string;
    file_name?: string;
    mime_type?: string;
    size_bytes?: number;
  }>;
  aspect_ratio: string;
  resolution: string;
  duration_seconds: number;
  billing_type: string;
  billing_snapshot: Record<string, unknown>;
  credit_cost: number;
  refunded_credit_cost: number;
  status:
    | "pending"
    | "submitted"
    | "processing"
    | "succeeded"
    | "failed"
    | "timed_out"
    | "refunded";
  submitted_at?: string;
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  timeout_at?: string;
  upstream_provider_id?: string;
  upstream_task_id?: string;
  upstream_request_json?: Record<string, unknown>;
  upstream_response_json?: Record<string, unknown>;
  video_url?: string;
  cover_url?: string;
  storage_expires_at?: string;
  storage_deleted_at?: string;
  error_message?: string;
  retry_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface ApiImageTask {
  id: string;
  user_id: string;
  model_id: string;
  prompt: string;
  negative_prompt?: string;
  input_types: string[];
  input_assets: Array<{
    asset_id?: string;
    asset_type?: string;
    url?: string;
    file_name?: string;
    mime_type?: string;
    size_bytes?: number;
  }>;
  aspect_ratio: string;
  size: string;
  n: number;
  billing_type: string;
  billing_snapshot: Record<string, unknown>;
  credit_cost: number;
  refunded_credit_cost: number;
  status:
    | "pending"
    | "submitted"
    | "processing"
    | "succeeded"
    | "failed"
    | "timed_out"
    | "refunded";
  submitted_at?: string;
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  timeout_at?: string;
  upstream_provider_id?: string;
  upstream_task_id?: string;
  upstream_request_json?: Record<string, unknown>;
  upstream_response_json?: Record<string, unknown>;
  upstream_image_urls?: string[];
  result_images?: Array<Record<string, unknown>>;
  image_urls?: string[];
  thumbnail_urls?: string[];
  storage_expires_at?: string;
  storage_deleted_at?: string;
  error_message?: string;
  retry_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface ApiCreateTaskResponse {
  task_id: string;
  status: string;
  credit_cost: number;
  credit_balance_after: number;
}

export interface ApiPreviewResponse {
  preview_url?: string;
  download_url?: string;
  urls?: string[];
  expires_at?: string;
}

export interface ApiCreditTransaction {
  id: string;
  user_id: string;
  change_amount: number;
  balance_after: number;
  transaction_type: "redeem" | "generation" | "refund";
  related_task_id?: string;
  related_image_task_id?: string;
  related_redeem_code_id?: string;
  note: string;
  created_at: string;
}

export interface ApiRedeemRecord {
  id: string;
  code_masked: string;
  credits: number;
  channel: string;
  redeemed_at: string;
  transaction_id: string;
}

export interface ApiRedeemCode {
  id: string;
  code: string;
  credits: number;
  batch_no: string;
  channel: string;
  note: string;
  status: "unused" | "used" | "disabled";
  used_by?: string;
  used_at?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiRedeemResponse {
  redeem_code_id: string;
  credits_added: number;
  credit_balance_after: number;
  transaction_id: string;
}

export interface ApiProvider {
  id: string;
  name: string;
  adapter_key: string;
  api_base_url: string;
  auth_type: string;
  credential_status: string;
  credential_preview: Record<string, unknown>;
  update_mode: "callback" | "polling" | "both";
  callback_secret_status: string;
  callback_secret_preview: string;
  polling_interval_seconds: number;
  max_wait_seconds: number;
  max_retry_count: number;
  status: "enabled" | "disabled";
  created_at?: string;
  updated_at?: string;
}

export interface ApiProviderMappings {
  provider_id: string;
  adapter_key: string;
  default_params: Record<string, unknown>;
  status_mapping: Record<string, unknown>;
  enum_mappings: Record<string, unknown>;
  request_mapping: Record<string, unknown>;
  result_mapping: Record<string, unknown>;
  updated_at?: string;
}

export interface ApiOverview {
  total_users: number;
  available_models: number;
  available_image_models?: number;
  processing_tasks: number;
  processing_image_tasks?: number;
  today_credit_consumption: number;
  recent_tasks: Array<{
    id: string;
    task_type?: "video" | "image";
    user_id: string;
    model_id: string;
    status: string;
    credit_cost: number;
    created_at: string;
  }>;
  recent_transactions: Array<{
    id: string;
    user_id: string;
    transaction_type: string;
    change_amount: number;
    balance_after: number;
    created_at: string;
  }>;
}
