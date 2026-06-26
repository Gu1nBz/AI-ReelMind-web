import { ApiError } from "@/api/client";

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.requestId) {
    return `${error.message}（${error.requestId}）`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "请求失败";
}

