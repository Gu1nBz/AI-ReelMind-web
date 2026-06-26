import { Card, Col, List, Row, Space, Table, Typography, message } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusTag } from "@/components/common/StatusTag";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import { CircleDollarSign, Film, History, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { ApiOverview } from "@/api/types";
import { getOverview } from "@/api/admin";
import { getErrorMessage } from "@/utils/errors";
import { formatAmount } from "@/utils/format";

export function AdminOverviewPage() {
  const ref = useAnimeEntrance("[data-animate-item]");
  const [overview, setOverview] = useState<ApiOverview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getOverview()
      .then(setOverview)
      .catch((error) => message.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { title: "用户数", value: String(overview?.total_users ?? 0), delta: "累计注册", icon: <Users size={16} /> },
    { title: "可用模型", value: String(overview?.available_models ?? 0), delta: "状态 available", icon: <Film size={16} /> },
    { title: "生成中任务", value: String(overview?.processing_tasks ?? 0), delta: "pending / submitted / processing", icon: <History size={16} /> },
    { title: "今日消耗", value: String(overview?.today_credit_consumption ?? 0), delta: "积分", icon: <CircleDollarSign size={16} /> }
  ];

  return (
    <AdminLayout>
      <div className="rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="后台概览"
            title="后台概览"
          />
          <Row gutter={[16, 16]} style={{ marginTop: 18 }}>
            {stats.map((item) => (
              <Col span={24} md={12} xl={6} key={item.title}>
                <MetricCard title={item.title} value={item.value} delta={item.delta} icon={item.icon} />
              </Col>
            ))}
          </Row>
        </Card>

        <Row gutter={[18, 18]} data-animate-item>
          <Col span={24} xl={14}>
            <Card bordered={false} className="rm-page-section">
              <Space direction="vertical" size={18} style={{ width: "100%" }}>
                <SectionHeader title="任务动态" />
                <Table
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 760 }}
                  loading={loading}
                  dataSource={overview?.recent_tasks ?? []}
                  columns={[
                    { title: "任务 ID", dataIndex: "id", key: "id" },
                    { title: "用户 ID", dataIndex: "user_id", key: "user_id" },
                    { title: "创建时间", dataIndex: "created_at", key: "created_at" },
                    {
                      title: "状态",
                      dataIndex: "status",
                      key: "status",
                      render: (value: string) => <StatusTag status={value} />
                    },
                    { title: "消耗积分", dataIndex: "credit_cost", key: "credit_cost" }
                  ]}
                />
              </Space>
            </Card>
          </Col>
          <Col span={24} xl={10}>
            <Card bordered={false} className="rm-page-section">
              <Space direction="vertical" size={18} style={{ width: "100%" }}>
                <SectionHeader title="最近积分变化" />
                <List
                  loading={loading}
                  dataSource={overview?.recent_transactions ?? []}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Typography.Text strong>{item.transaction_type}</Typography.Text>
                            <Typography.Text type="secondary">{item.created_at}</Typography.Text>
                          </Space>
                        }
                        description={`变动 ${formatAmount(item.change_amount)}，余额 ${item.balance_after}`}
                      />
                    </List.Item>
                  )}
                />
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}
