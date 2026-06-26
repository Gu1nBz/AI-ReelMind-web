import { Card, Col, Row, Space, Table, message } from "antd";
import { MetricCard } from "@/components/ui/MetricCard";
import { UserLayout } from "@/components/layout/UserLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { formatAmount, formatCredits, titleCaseStatus } from "@/utils/format";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import { useEffect, useState } from "react";
import type { TransactionRecord } from "@/mock/types";
import { listUserTransactions } from "@/api/user";
import { toTransaction } from "@/api/adapters";
import { getErrorMessage } from "@/utils/errors";
import { useAuth } from "@/hooks/useAuth";

export function ProfilePage() {
  const ref = useAnimeEntrance("[data-animate-item]");
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }
    setLoading(true);
    listUserTransactions(1, 50)
      .then((result) => setTransactions(result.list.map(toTransaction)))
      .catch((error) => message.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <UserLayout>
      <div className="rm-page-shell rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="个人中心"
            title={user?.email?.split("@")[0] ?? "未登录"}
            description={user ? `${user.email} · 注册于 ${user.member_since}` : "请登录后查看账户信息"}
          />
          <Row gutter={[16, 16]} style={{ marginTop: 18 }}>
            <Col span={24} md={8}>
              <MetricCard title="当前余额" value={formatCredits(user?.credit_balance ?? 0)} delta="可立即用于生成" />
            </Col>
            <Col span={24} md={8}>
              <MetricCard title="累计充值" value={formatCredits(user?.total_recharge_credits ?? 0)} delta="全部来自兑换码" />
            </Col>
            <Col span={24} md={8}>
              <MetricCard title="累计消耗" value={formatCredits(user?.total_consumed_credits ?? 0)} delta="包含失败任务前置扣费" />
            </Col>
          </Row>
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <SectionHeader
              eyebrow="积分流水"
              title="全部积分变动记录"
              description="包括兑换码充值、任务扣费和失败退款。"
            />
            <Table
              rowKey="id"
              pagination={false}
              scroll={{ x: 720 }}
              loading={loading}
              dataSource={transactions}
              columns={[
                { title: "时间", dataIndex: "createdAt", key: "createdAt" },
                {
                  title: "业务类型",
                  dataIndex: "type",
                  key: "type",
                  render: (value: string) => titleCaseStatus(value)
                },
                {
                  title: "积分变化",
                  dataIndex: "amount",
                  key: "amount",
                  render: (value: number) => formatAmount(value)
                },
                {
                  title: "余额",
                  dataIndex: "balanceAfter",
                  key: "balanceAfter",
                  render: (value: number) => formatCredits(value)
                },
                { title: "备注", dataIndex: "note", key: "note" }
              ]}
            />
          </Space>
        </Card>
      </div>
    </UserLayout>
  );
}
