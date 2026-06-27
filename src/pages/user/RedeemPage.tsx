import { Button, Card, Form, Input, Space, Table, Typography, message } from "antd";
import { KeyRound, ShieldCheck } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCredits } from "@/utils/format";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import { useCallback, useEffect, useState } from "react";
import type { RedeemCodeRecord } from "@/types/domain";
import { listRedeemRecords, redeemCode } from "@/api/user";
import { toRedeemRecord } from "@/api/adapters";
import { getErrorMessage } from "@/utils/errors";
import { useAuth } from "@/hooks/useAuth";

export function RedeemPage() {
  const ref = useAnimeEntrance("[data-animate-item]");
  const [records, setRecords] = useState<RedeemCodeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { user, refreshUser } = useAuth();

  const loadRecords = useCallback(async () => {
    if (!user) {
      setRecords([]);
      return;
    }
    setLoading(true);
    try {
      const result = await listRedeemRecords(1, 20);
      setRecords(result.list.map(toRedeemRecord));
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const handleRedeem = async (values: { code: string }) => {
    if (!user) {
      message.warning("请先登录后再兑换");
      return;
    }
    setLoading(true);
    try {
      const result = await redeemCode(values.code);
      message.success(`兑换成功，到账 ${formatCredits(result.credits_added)}`);
      form.resetFields();
      await Promise.all([refreshUser(), loadRecords()]);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

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
              form={form}
              layout="vertical"
              onFinish={handleRedeem}
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
              <Button htmlType="submit" type="primary" size="large" loading={loading} disabled={!user}>
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
              loading={loading}
              dataSource={records}
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
