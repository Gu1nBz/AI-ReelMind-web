import { Card, Col, Row, Space, Typography } from "antd";
import { UserLayout } from "@/components/layout/UserLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { supportCards } from "@/mock/data";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";

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
