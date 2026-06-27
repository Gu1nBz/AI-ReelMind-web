import {
  BadgePercent,
  CircleDollarSign,
  Database,
  Film,
  History,
  KeyRound,
  LayoutDashboard,
  MessageSquareText,
  Users
} from "lucide-react";
import type { NavItem } from "@/types/domain";

export const siteNav: NavItem[] = [
  { key: "workspace", label: "工作室", path: "/" },
  { key: "history", label: "历史", path: "/history" },
  { key: "pricing", label: "定价", path: "/pricing" },
  { key: "redeem", label: "兑换", path: "/redeem" },
  { key: "contact", label: "联系", path: "/contact" }
];

export const adminNav = [
  { key: "overview", label: "控制台", path: "/admin", icon: <LayoutDashboard size={18} /> },
  { key: "models", label: "模型管理", path: "/admin/models", icon: <Film size={18} /> },
  { key: "providers", label: "上游供应商", path: "/admin/providers", icon: <Database size={18} /> },
  { key: "promptFields", label: "提示词字段", path: "/admin/prompt-fields", icon: <MessageSquareText size={18} /> },
  { key: "packages", label: "积分套餐", path: "/admin/packages", icon: <BadgePercent size={18} /> },
  { key: "redeemCodes", label: "兑换码", path: "/admin/redeem-codes", icon: <KeyRound size={18} /> },
  { key: "users", label: "用户管理", path: "/admin/users", icon: <Users size={18} /> },
  { key: "tasks", label: "任务管理", path: "/admin/tasks", icon: <History size={18} /> },
  { key: "transactions", label: "积分流水", path: "/admin/transactions", icon: <CircleDollarSign size={18} /> }
];
