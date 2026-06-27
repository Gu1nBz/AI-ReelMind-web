import { Button, Card, Col, Empty, Row, Space, Typography, message } from "antd";
import { Gift, Wallet } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import { useEffect, useState } from "react";
import type { CreditPackage } from "@/types/domain";
import { listPublicPackages } from "@/api/public";
import { toCreditPackage } from "@/api/adapters";
import { getErrorMessage } from "@/utils/errors";

export function PricingPage() {
  const ref = useAnimeEntrance("[data-animate-item]");
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    listPublicPackages()
      .then((result) => setPackages(result.list.map(toCreditPackage)))
      .catch((error) => message.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserLayout>
      <div className="rm-page-shell rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="积分充值"
            title="积分套餐"
          />
        </Card>

        {packages.length === 0 && !loading ? <Empty description="暂无可购买套餐" /> : null}

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
                  <Button
                    type={item.recommended ? "primary" : "default"}
                    size="large"
                    block
                    loading={loading}
                    onClick={() => {
                      if (!item.paymentUrl) {
                        message.warning("该套餐暂未配置支付链接");
                        return;
                      }
                      window.open(item.paymentUrl, "_blank", "noopener,noreferrer");
                    }}
                  >
                    {item.buttonText || "跳转外部支付页"}
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
