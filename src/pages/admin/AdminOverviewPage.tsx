import { Card, Col, List, Row, Space, Table, Typography } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { adminStats, tasks, transactions } from "@/mock/data";
import { StatusTag } from "@/components/common/StatusTag";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";

export function AdminOverviewPage() {
  const ref = useAnimeEntrance("[data-animate-item]");

  return (
    <AdminLayout>
      <div className="rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="后台概览"
            title="后台概览"
          />
          <Row gutter={[16, 16]} style={{ marginTop: 18 }}>
            {adminStats.map((item) => (
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
                  dataSource={tasks}
                  columns={[
                    { title: "任务 ID", dataIndex: "id", key: "id" },
                    { title: "模型", dataIndex: "modelName", key: "modelName" },
                    { title: "创建时间", dataIndex: "createdAt", key: "createdAt" },
                    {
                      title: "状态",
                      dataIndex: "status",
                      key: "status",
                      render: (value: string) => <StatusTag status={value} />
                    },
                    { title: "消耗积分", dataIndex: "cost", key: "cost" }
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
                  dataSource={transactions}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Typography.Text strong>{item.note}</Typography.Text>
                            <Typography.Text type="secondary">{item.createdAt}</Typography.Text>
                          </Space>
                        }
                        description={`变动 ${item.amount}，余额 ${item.balanceAfter}`}
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
