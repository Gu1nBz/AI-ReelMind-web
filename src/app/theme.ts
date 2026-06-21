import type { ThemeConfig } from "antd";

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: "#ff6a1a",
    colorSuccess: "#18b67a",
    colorWarning: "#f59e0b",
    colorError: "#e5484d",
    colorInfo: "#2f6bff",
    colorTextBase: "#171717",
    colorBgBase: "#f7f8fa",
    fontFamily:
      "\"Noto Sans SC\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif",
    borderRadius: 14,
    borderRadiusLG: 18,
    boxShadow:
      "0 20px 40px rgba(17, 24, 39, 0.08), 0 6px 18px rgba(17, 24, 39, 0.04)"
  },
  components: {
    Layout: {
      headerBg: "rgba(255,255,255,0.84)",
      bodyBg: "#f7f8fa",
      siderBg: "#101114",
      triggerBg: "#0f1013"
    },
    Menu: {
      itemBorderRadius: 12,
      itemHeight: 42,
      itemMarginInline: 8,
      itemSelectedBg: "rgba(255, 106, 26, 0.12)",
      itemSelectedColor: "#ff6a1a"
    },
    Button: {
      controlHeight: 42,
      contentFontSize: 15,
      fontWeight: 600,
      defaultShadow: "none",
      primaryShadow: "0 10px 24px rgba(255, 106, 26, 0.2)"
    },
    Card: {
      borderRadiusLG: 20
    },
    Tabs: {
      cardBg: "rgba(255,255,255,0.7)"
    }
  }
};
