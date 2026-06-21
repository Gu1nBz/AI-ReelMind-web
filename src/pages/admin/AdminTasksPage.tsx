import { Button, Card, Space, Table, Typography } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusTag } from "@/components/common/StatusTag";
import { tasks } from "@/mock/data";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";

export function AdminTasksPage() {
  const ref = useAnimeEntrance("[data-animate-item]");

  return (
    <AdminLayout>
      <div className="rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="任务管理"
            title="任务管理"
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="id"
            scroll={{ x: 1220 }}
            dataSource={tasks}
            columns={[
              { title: "任务 ID", dataIndex: "id", key: "id" },
              { title: "模型", dataIndex: "modelName", key: "modelName" },
              { title: "提示词", dataIndex: "prompt", key: "prompt", width: 340, ellipsis: true },
              { title: "创建时间", dataIndex: "createdAt", key: "createdAt" },
              {
                title: "状态",
                dataIndex: "status",
                key: "status",
                render: (value: string) => <StatusTag status={value} />
              },
              { title: "积分消耗", dataIndex: "cost", key: "cost" },
              {
                title: "操作",
                key: "actions",
                render: (_, record) => (
                  <Space>
                    <Button>查看详情</Button>
                    {record.status === "processing" ? <Button danger>标记失败</Button> : null}
                  </Space>
                )
              }
            ]}
            expandable={{
              expandedRowRender: (record) => (
                <Space direction="vertical">
                  <Typography.Text>
                    参数：{record.aspectRatio} / {record.resolution} / {record.duration} 秒
                  </Typography.Text>
                  {record.errorMessage ? <Typography.Text type="danger">{record.errorMessage}</Typography.Text> : null}
                </Space>
              )
            }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
