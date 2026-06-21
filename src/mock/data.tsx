import {
  AudioLines,
  BadgePercent,
  Box,
  CircleDollarSign,
  Clapperboard,
  Database,
  Film,
  History,
  KeyRound,
  LayoutDashboard,
  Layers3,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import type {
  AdminStat,
  AdvancedPromptField,
  CreditPackage,
  DemoComparison,
  GenerationTask,
  NavItem,
  ProviderMapping,
  RedeemCodeRecord,
  TransactionRecord,
  UserProfile,
  UserRow,
  VideoModel
} from "@/mock/types";

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

export const models: VideoModel[] = [
  {
    id: "grok-video",
    name: "Grok Video",
    provider: "xAI",
    badge: "热门",
    description: "创意表达",
    status: "available",
    billingType: "per_second",
    price: 16,
    aspectRatios: ["16:9", "9:16", "1:1"],
    resolutions: ["480p", "720p"],
    durations: [5, 8, 10],
    inputCapabilities: [
      { key: "text", label: "文本", required: true },
      { key: "image", label: "图片" },
      { key: "audio", label: "音频" }
    ],
    highlights: ["电影感镜头", "高级提示词", "音频参考"]
  },
  {
    id: "veo-lite",
    name: "Veo Lite",
    provider: "Google AI",
    badge: "稳定",
    description: "稳定出片",
    status: "available",
    billingType: "per_generation",
    price: 88,
    aspectRatios: ["16:9", "9:16"],
    resolutions: ["720p"],
    durations: [6],
    defaultDuration: 6,
    inputCapabilities: [
      { key: "text", label: "文本", required: true },
      { key: "image", label: "图片" },
      { key: "video", label: "视频" }
    ],
    highlights: ["稳定结构", "品牌短片", "默认 6 秒"]
  },
  {
    id: "kling-preview",
    name: "Kling Preview",
    provider: "Kuaishou",
    badge: "即将推出",
    description: "暂不可用",
    status: "coming_soon",
    billingType: "per_second",
    price: 20,
    aspectRatios: ["16:9", "9:16", "1:1"],
    resolutions: ["480p", "720p"],
    durations: [5, 10],
    inputCapabilities: [{ key: "text", label: "文本", required: true }],
    highlights: ["即将上线", "不可生成", "预览中"]
  }
];

export const advancedPromptFields: AdvancedPromptField[] = [
  {
    key: "subject",
    label: "主要科目",
    description: "视频中的主角、主体或核心物体。",
    placeholder: "例如：一位穿风衣的女导演，站在雨夜街头",
    type: "input",
    required: true
  },
  {
    key: "action",
    label: "行动",
    description: "主体在做什么。",
    placeholder: "例如：转身看向镜头，慢慢抬手示意",
    type: "input",
    required: true
  },
  {
    key: "environment",
    label: "设置 / 环境",
    description: "环境、空间和地点。",
    placeholder: "例如：上海夜景天桥，霓虹反射在湿润地面",
    type: "textarea"
  },
  {
    key: "lighting",
    label: "照明 / 时间",
    description: "光线、时间、氛围。",
    placeholder: "例如：蓝调时刻，柔和背光，空气有薄雾",
    type: "input"
  },
  {
    key: "style",
    label: "视觉风格",
    description: "整体美术和镜头风格。",
    placeholder: "选择或输入风格",
    type: "select",
    options: ["电影感", "写实广告", "未来感 CG", "轻写实插画", "国潮质感"]
  },
  {
    key: "camera",
    label: "镜头",
    description: "镜头运动和视角。",
    placeholder: "选择或输入镜头",
    type: "select",
    options: ["特写", "中景推镜", "横移跟拍", "航拍", "POV"]
  },
  {
    key: "details",
    label: "附加详情",
    description: "细节、服装、氛围和特效。",
    placeholder: "例如：雨滴打在镜头前景，衣摆被风吹起，镜头有轻微 flare",
    type: "textarea"
  }
];

export const comparisons: DemoComparison[] = [
  {
    id: "mountain",
    title: "图像到视频动效",
    subtitle: "",
    sourceLabel: "参考图片",
    resultLabel: "生成视频",
    sourceImage:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    resultImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "fashion",
    title: "商品模特短片",
    subtitle: "",
    sourceLabel: "静态海报",
    resultLabel: "成片效果",
    sourceImage:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
    resultImage:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "city",
    title: "剧情氛围镜头",
    subtitle: "",
    sourceLabel: "场景设定",
    resultLabel: "镜头表现",
    sourceImage:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
    resultImage:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80"
  }
];

export const packages: CreditPackage[] = [
  {
    id: "starter",
    title: "入门体验包",
    credits: 100,
    priceLabel: "¥99",
    description: "",
    features: ["100 积分", "全部可用模型", "兑换码充值"],
    paymentProvider: "外链支付页 A"
  },
  {
    id: "growth",
    title: "创作常用包",
    credits: 500,
    priceLabel: "¥459",
    recommended: true,
    description: "",
    features: ["500 积分", "推荐套餐", "高频使用"],
    paymentProvider: "外链支付页 B"
  },
  {
    id: "studio",
    title: "团队试产包",
    credits: 1000,
    priceLabel: "¥880",
    description: "",
    features: ["1000 积分", "更低单次成本", "多轮试产"],
    paymentProvider: "外链支付页 C"
  }
];

export const userProfile: UserProfile = {
  name: "林然",
  email: "linran@reelmind.ai",
  credits: 268,
  rechargeCredits: 1200,
  consumedCredits: 932,
  memberSince: "2026-05-12"
};

export const tasks: GenerationTask[] = [
  {
    id: "TASK-8201",
    createdAt: "2026-06-21 10:08",
    modelName: "Grok Video",
    prompt: "雨夜街头，一位短发女导演回头看向镜头，霓虹倒影流动。",
    promptMode: "advanced",
    inputTypes: ["text", "image"],
    aspectRatio: "9:16",
    resolution: "720p",
    duration: 8,
    cost: 192,
    status: "processing",
    thumbnail:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "TASK-8194",
    createdAt: "2026-06-21 09:32",
    modelName: "Veo Lite",
    prompt: "新中式茶饮品牌静物，镜头缓慢推进，蒸汽升腾。",
    promptMode: "basic",
    inputTypes: ["text", "image"],
    aspectRatio: "16:9",
    resolution: "720p",
    duration: 6,
    cost: 88,
    status: "succeeded",
    thumbnail:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    videoUrl: "#"
  },
  {
    id: "TASK-8177",
    createdAt: "2026-06-20 23:16",
    modelName: "Grok Video",
    prompt: "太空舱内景，人物从窗前走过，光影摇晃。",
    promptMode: "advanced",
    inputTypes: ["text", "audio"],
    aspectRatio: "16:9",
    resolution: "480p",
    duration: 5,
    cost: 80,
    status: "refunded",
    thumbnail:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
    errorMessage: "上游内容审核未通过，已自动退还积分。"
  }
];

export const transactions: TransactionRecord[] = [
  {
    id: "TX-9021",
    type: "generation",
    amount: -192,
    balanceAfter: 268,
    note: "Grok Video 任务扣费",
    createdAt: "2026-06-21 10:08"
  },
  {
    id: "TX-9006",
    type: "generation",
    amount: -88,
    balanceAfter: 460,
    note: "Veo Lite 任务扣费",
    createdAt: "2026-06-21 09:32"
  },
  {
    id: "TX-8950",
    type: "refund",
    amount: 80,
    balanceAfter: 548,
    note: "失败任务退款",
    createdAt: "2026-06-20 23:28"
  },
  {
    id: "TX-8901",
    type: "redeem",
    amount: 500,
    balanceAfter: 468,
    note: "兑换码充值 GROWTH-202606",
    createdAt: "2026-06-20 22:11"
  }
];

export const redeemCodes: RedeemCodeRecord[] = [
  {
    id: "RC-1001",
    code: "REEL-START-88A9",
    credits: 100,
    batchNo: "BATCH-0601",
    channel: "小红书活动",
    status: "unused",
    expiresAt: "2026-07-15"
  },
  {
    id: "RC-1002",
    code: "REEL-GROWTH-77Q1",
    credits: 500,
    batchNo: "BATCH-0608",
    channel: "人工补偿",
    status: "used",
    usedBy: "linran@reelmind.ai",
    usedAt: "2026-06-20 22:11",
    expiresAt: "2026-07-30"
  },
  {
    id: "RC-1003",
    code: "REEL-DISABLE-08D2",
    credits: 300,
    batchNo: "BATCH-0609",
    channel: "商务赠送",
    status: "disabled",
    expiresAt: "2026-07-01"
  }
];

export const adminStats: AdminStat[] = [
  {
    title: "今日创建任务",
    value: "126",
    delta: "+12.4%",
    icon: <Clapperboard size={18} />
  },
  {
    title: "处理中任务",
    value: "34",
    delta: "-4.1%",
    icon: <Layers3 size={18} />
  },
  {
    title: "今日兑换入账",
    value: "4,800",
    delta: "+18.9%",
    icon: <Sparkles size={18} />
  },
  {
    title: "可用模型数",
    value: "2 / 3",
    delta: "1 个待发布",
    icon: <ShieldCheck size={18} />
  }
];

export const providerMappings: ProviderMapping[] = [
  {
    id: "PRO-01",
    name: "xAI Video Gateway",
    adapterKey: "xai_grok_video",
    updateMode: "both",
    status: "enabled",
    endpoint: "https://provider.mock/xai/video",
    lastCheckAt: "2026-06-21 10:12"
  },
  {
    id: "PRO-02",
    name: "Google Veo Proxy",
    adapterKey: "google_veo_lite",
    updateMode: "polling",
    status: "enabled",
    endpoint: "https://provider.mock/google/veo",
    lastCheckAt: "2026-06-21 10:10"
  },
  {
    id: "PRO-03",
    name: "Kuaishou Preview",
    adapterKey: "kuaishou_kling_preview",
    updateMode: "callback",
    status: "disabled",
    endpoint: "https://provider.mock/kuaishou/kling",
    lastCheckAt: "2026-06-20 18:00"
  }
];

export const users: UserRow[] = [
  {
    id: "USER-01",
    email: "linran@reelmind.ai",
    credits: 268,
    totalRecharge: 1200,
    totalConsumed: 932,
    lastLogin: "2026-06-21 09:58",
    registeredAt: "2026-05-12 14:10"
  },
  {
    id: "USER-02",
    email: "brand-team@studio.com",
    credits: 920,
    totalRecharge: 3000,
    totalConsumed: 2080,
    lastLogin: "2026-06-21 09:10",
    registeredAt: "2026-05-20 10:02"
  },
  {
    id: "USER-03",
    email: "creator-echo@outlook.com",
    credits: 54,
    totalRecharge: 500,
    totalConsumed: 446,
    lastLogin: "2026-06-20 23:17",
    registeredAt: "2026-06-01 19:44"
  }
];

export const quickGuides = [
  {
    title: "工作台说明",
    detail:
      "先选择模型，再按当前需求一次性填写提示词、参考素材和生成参数即可，不需要把创作说明拆成几个独立模块来理解；系统会根据所选模型自动显示可用输入项、按规则计算预计积分，并在提交成功后立即创建任务，失败任务会自动退款。"
  }
];

export const supportCards = [
  {
    title: "商务合作",
    detail: "",
    action: "bd@reelmind.ai",
    icon: <Box size={28} />
  },
  {
    title: "产品反馈",
    detail: "",
    action: "feedback@reelmind.ai",
    icon: <MessageSquareText size={28} />
  },
  {
    title: "创作支持群",
    detail: "",
    action: "加入微信社群",
    icon: <AudioLines size={28} />
  }
];
