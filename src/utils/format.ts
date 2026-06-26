export function formatCredits(value: number) {
  return `${value.toLocaleString("zh-CN")} 积分`;
}

export function formatAmount(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toLocaleString("zh-CN")}`;
}

export function titleCaseStatus(status: string) {
  const map: Record<string, string> = {
    available: "可用",
    maintenance: "维护中",
    coming_soon: "即将推出",
    pending: "等待中",
    submitted: "已提交",
    processing: "生成中",
    succeeded: "已成功",
    failed: "生成失败",
    timed_out: "已超时",
    refunded: "已退款",
    redeem: "兑换充值",
    generation: "任务扣费",
    refund: "任务退款",
    unused: "未使用",
    used: "已使用",
    disabled: "已禁用",
    enabled: "启用中",
    visible: "展示中",
    hidden: "已隐藏",
    input: "单行输入",
    textarea: "多行输入",
    select: "下拉选择",
    combobox: "可输入选择"
  };

  return map[status] ?? status;
}
