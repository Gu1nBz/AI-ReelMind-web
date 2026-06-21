import { Button, Card, Space, Typography } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { DemoComparison } from "@/mock/types";

interface ComparisonShowcaseProps {
  items: DemoComparison[];
}

export function ComparisonShowcase({ items }: ComparisonShowcaseProps) {
  const [index, setIndex] = useState(0);
  const current = useMemo(() => items[index], [index, items]);
  const [position, setPosition] = useState(54);

  return (
    <Card bordered={false} className="rm-page-section" style={{ padding: 12 }}>
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              AI 视频生成示例
            </Typography.Title>
          </div>
          <Space>
            <Button
              icon={<ChevronLeft size={16} />}
              onClick={() => setIndex((prev) => (prev - 1 + items.length) % items.length)}
              aria-label="查看上一个示例"
            />
            <Button
              icon={<ChevronRight size={16} />}
              onClick={() => setIndex((prev) => (prev + 1) % items.length)}
              aria-label="查看下一个示例"
            />
          </Space>
        </div>

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 22,
            minHeight: 380,
            background: "#0f1117"
          }}
        >
          <img
            src={current.resultImage}
            alt={current.resultLabel}
            style={{ width: "100%", height: 420, objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${position}%`,
              overflow: "hidden",
              borderRight: "2px solid rgba(255,255,255,0.88)"
            }}
          >
            <img
              src={current.sourceImage}
              alt={current.sourceLabel}
              style={{ width: "100%", height: 420, objectFit: "cover" }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: `calc(${position}% - 18px)`,
              top: "50%",
              transform: "translateY(-50%)",
              width: 36,
              height: 36,
              borderRadius: 999,
              background: "#fff",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 22px rgba(0,0,0,0.18)"
            }}
          >
            <div
              style={{
                width: 4,
                height: 18,
                borderRadius: 999,
                background: "#ff6a1a"
              }}
            />
          </div>
          <input
            type="range"
            min={20}
            max={80}
            value={position}
            aria-label="调整示例对比位置"
            onChange={(event) => setPosition(Number(event.target.value))}
            style={{
              position: "absolute",
              insetInline: 16,
              bottom: 16,
              width: "calc(100% - 32px)"
            }}
          />
          <span
            className="rm-badge"
            style={{ position: "absolute", top: 16, left: 16, background: "rgba(17,24,39,0.62)", color: "#fff" }}
          >
            {current.sourceLabel}
          </span>
          <span
            className="rm-badge"
            style={{ position: "absolute", top: 16, right: 16, background: "rgba(17,24,39,0.62)", color: "#fff" }}
          >
            {current.resultLabel}
          </span>
        </div>

        <div>
          <Typography.Title level={4} style={{ marginBottom: 6 }}>
            {current.title}
          </Typography.Title>
          <Typography.Text className="rm-muted">
            拖动中线查看参考图与生成效果的构图差异。
          </Typography.Text>
        </div>
      </Space>
    </Card>
  );
}
