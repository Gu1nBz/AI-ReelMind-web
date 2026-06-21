import { Button, Card, Space, Table, Typography } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusTag } from "@/components/common/StatusTag";
import { models } from "@/mock/data";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";

export function AdminModelsPage() {
  const ref = useAnimeEntrance("[data-animate-item]");

  return (
    <AdminLayout>
      <div className="rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="模型管理"
            title="模型管理"
            extra={<Button type="primary">新增模型</Button>}
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="id"
            scroll={{ x: 1200 }}
            dataSource={models}
            columns={[
              { title: "模型名称", dataIndex: "name", key: "name" },
              { title: "供应商", dataIndex: "provider", key: "provider" },
              {
                title: "状态",
                dataIndex: "status",
                key: "status",
                render: (value: string) => <StatusTag status={value} />
              },
              {
                title: "计费方式",
                dataIndex: "billingType",
                key: "billingType",
                render: (value: string) => (value === "per_second" ? "按秒计费" : "按次计费")
              },
              { title: "价格", dataIndex: "price", key: "price", render: (value: number) => `${value} 积分` },
              {
                title: "输入能力",
                dataIndex: "inputCapabilities",
                key: "inputCapabilities",
                render: (_, record) => record.inputCapabilities.map((item) => item.label).join(" / ")
              },
              {
                title: "比例",
                dataIndex: "aspectRatios",
                key: "aspectRatios",
                render: (value: string[]) => value.join("、")
              },
              {
                title: "清晰度",
                dataIndex: "resolutions",
                key: "resolutions",
                render: (value: string[]) => value.join("、")
              },
              {
                title: "时长",
                dataIndex: "durations",
                key: "durations",
                render: (value: number[]) => value.map((item) => `${item} 秒`).join("、")
              },
              {
                title: "操作",
                key: "actions",
                render: () => (
                  <Space>
                    <Button>编辑</Button>
                    <Button type="primary" ghost>
                      配置参数
                    </Button>
                  </Space>
                )
              }
            ]}
            expandable={{
              expandedRowRender: (record) => (
                <Space direction="vertical">
                  <Typography.Text>{record.description}</Typography.Text>
                  <Typography.Text type="secondary">{record.highlights.join(" · ")}</Typography.Text>
                </Space>
              )
            }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
