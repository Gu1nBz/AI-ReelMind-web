import { Badge } from "antd";
import { titleCaseStatus } from "@/utils/format";

const statusMap: Record<string, string> = {
  available: "success",
  maintenance: "warning",
  coming_soon: "processing",
  pending: "default",
  submitted: "processing",
  processing: "processing",
  succeeded: "success",
  failed: "error",
  refunded: "purple",
  unused: "default",
  used: "success",
  disabled: "error",
  enabled: "success"
};

export function StatusTag({ status }: { status: string }) {
  return (
    <Badge
      color={statusMap[status] ?? "default"}
      text={<span style={{ color: "#4b5563", fontWeight: 500 }}>{titleCaseStatus(status)}</span>}
    />
  );
}
