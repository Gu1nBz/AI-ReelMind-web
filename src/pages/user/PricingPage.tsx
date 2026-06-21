import { Button, Card, Col, Row, Space, Typography } from "antd";
import { Gift, Wallet } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { packages } from "@/mock/data";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";

export function PricingPage() {
  const ref = useAnimeEntrance("[data-animate-item]");

  return (
    <UserLayout>
      <div className="rm-page-shell rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="积分充值"
            title="积分套餐"
          />
        </Card>

        <Row gutter={[20, 20]} data-animate-item>
          {packages.map((item) => (
            <Col span={24} lg={8} key={item.id}>
              <Card bordered={false} className="rm-page-section rm-card-hover" style={{ height: "100%" }}>
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  <Space>
                    <span className="rm-badge">
                      {item.recommended ? <Gift size={14} /> : <Wallet size={14} />}
                      {item.recommended ? "推荐套餐" : "标准套餐"}
                    </span>
                  </Space>
                  <Typography.Title level={3} style={{ margin: 0 }}>
                    {item.title}
                  </Typography.Title>
                  <Typography.Title level={1} style={{ margin: 0 }}>
                    {item.priceLabel}
                  </Typography.Title>
                  <Typography.Text strong>{item.credits} 积分到账</Typography.Text>
                  <Typography.Paragraph className="rm-muted">{item.description}</Typography.Paragraph>
                  <Space direction="vertical" size={10} style={{ width: "100%" }}>
                    {item.features.map((feature) => (
                      <Typography.Text key={feature}>{feature}</Typography.Text>
                    ))}
                  </Space>
                  <Button type={item.recommended ? "primary" : "default"} size="large" block>
                    跳转外部支付页
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </UserLayout>
  );
}
