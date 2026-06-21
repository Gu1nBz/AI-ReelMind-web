import { Button, Card, Form, Input, Space, Table, Typography, message } from "antd";
import { KeyRound, ShieldCheck } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { redeemCodes } from "@/mock/data";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCredits } from "@/utils/format";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";

export function RedeemPage() {
  const ref = useAnimeEntrance("[data-animate-item]");

  return (
    <UserLayout>
      <div className="rm-page-shell rm-grid-2" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Space direction="vertical" size={22} style={{ width: "100%" }}>
            <SectionHeader
              eyebrow="兑换码充值"
              title="输入兑换码完成积分入账"
            />

            <Form
              layout="vertical"
              onFinish={() => message.success("兑换成功")}
            >
              <Form.Item
                label="兑换码"
                name="code"
                required
                rules={[{ required: true, message: "请输入兑换码" }]}
              >
                <Input
                  prefix={<KeyRound size={16} />}
                  placeholder="例如：REEL-GROWTH-77Q1"
                  maxLength={32}
                />
              </Form.Item>
              <Form.Item label="校验规则">
                <Card bordered={false} style={{ background: "rgba(47,107,255,0.06)" }}>
                  <Space>
                    <ShieldCheck size={18} color="#2f6bff" />
                    <Typography.Text className="rm-muted">
                      系统会校验兑换码是否存在、已使用、已禁用或已过期。成功后会写入积分流水。
                    </Typography.Text>
                  </Space>
                </Card>
              </Form.Item>
              <Button htmlType="submit" type="primary" size="large">
                立即兑换
              </Button>
            </Form>
          </Space>
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <SectionHeader
              eyebrow="状态"
              title="兑换码状态预览"
            />
            <Table
              rowKey="id"
              pagination={false}
              scroll={{ x: 680 }}
              dataSource={redeemCodes}
              columns={[
                { title: "兑换码", dataIndex: "code", key: "code" },
                {
                  title: "积分",
                  dataIndex: "credits",
                  key: "credits",
                  render: (value: number) => formatCredits(value)
                },
                { title: "渠道", dataIndex: "channel", key: "channel" },
                {
                  title: "状态",
                  dataIndex: "status",
                  key: "status",
                  render: (value: string) => <StatusTag status={value} />
                }
              ]}
            />
          </Space>
        </Card>
      </div>
    </UserLayout>
  );
}
