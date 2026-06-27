import { Card, Col, Row, Space, Typography } from "antd";
import { AudioLines, Box, MessageSquareText } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";

const supportCards = [
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

export function ContactPage() {
  const ref = useAnimeEntrance("[data-animate-item]");

  return (
    <UserLayout>
      <div className="rm-page-shell rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="联系支持"
            title="联系支持"
          />
        </Card>

        <Row gutter={[20, 20]} data-animate-item>
          {supportCards.map((card) => (
            <Col span={24} lg={8} key={card.title}>
              <Card bordered={false} className="rm-page-section rm-card-hover" style={{ height: "100%" }}>
                <Space direction="vertical" size={14}>
                  <span className="rm-badge">{card.icon}</span>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {card.title}
                  </Typography.Title>
                  <Typography.Paragraph className="rm-muted">{card.detail}</Typography.Paragraph>
                  <Typography.Text strong style={{ fontSize: 18 }}>
                    {card.action}
                  </Typography.Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </UserLayout>
  );
}
