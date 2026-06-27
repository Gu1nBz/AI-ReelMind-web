import { Card, Col, Row, Space, Typography } from "antd";
import { ImageIcon, Mic, Sparkles, Video } from "lucide-react";
import type { VideoModel } from "@/types/domain";
import { StatusTag } from "@/components/common/StatusTag";

interface ModelSelectorProps {
  models: VideoModel[];
  selectedId: string;
  onSelect: (value: string) => void;
}

const icons = {
  image: <ImageIcon size={15} />,
  video: <Video size={15} />,
  audio: <Mic size={15} />,
  text: <Sparkles size={15} />
};

export function ModelSelector({ models, selectedId, onSelect }: ModelSelectorProps) {
  return (
    <Row gutter={[12, 12]}>
      {models.map((model) => {
        const active = model.id === selectedId;
        return (
          <Col span={24} md={12} xl={8} key={model.id}>
            <Card
              hoverable
              className="rm-card-hover"
              onClick={() => onSelect(model.id)}
              style={{
                borderColor: active ? "rgba(255, 106, 26, 0.26)" : undefined,
                background: active ? "rgba(255, 245, 238, 0.96)" : undefined
              }}
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Space style={{ justifyContent: "space-between", width: "100%" }}>
                  <Space direction="vertical" size={2}>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {model.name}
                    </Typography.Title>
                    <Typography.Text type="secondary">{model.provider}</Typography.Text>
                  </Space>
                  <StatusTag status={model.status} />
                </Space>
                <Typography.Paragraph className="rm-muted" style={{ margin: 0 }}>
                  {model.description}
                </Typography.Paragraph>
                <Space wrap size={[8, 8]}>
                  <span className="rm-badge">{model.badge}</span>
                  {model.inputCapabilities.map((item) => (
                    <span
                      key={item.key}
                      className="rm-badge"
                      style={{ background: "rgba(47, 107, 255, 0.08)", color: "#2f6bff" }}
                    >
                      {icons[item.key]}
                      {item.label}
                    </span>
                  ))}
                </Space>
              </Space>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
