import { Button, Card, Space, Table } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusTag } from "@/components/common/StatusTag";
import { providerMappings } from "@/mock/data";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";

export function AdminProvidersPage() {
  const ref = useAnimeEntrance("[data-animate-item]");

  return (
    <AdminLayout>
      <div className="rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="上游供应商"
            title="上游供应商"
            extra={<Button type="primary">新增供应商</Button>}
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="id"
            dataSource={providerMappings}
            scroll={{ x: 960 }}
            columns={[
              { title: "供应商名称", dataIndex: "name", key: "name" },
              { title: "适配器 Key", dataIndex: "adapterKey", key: "adapterKey" },
              { title: "更新方式", dataIndex: "updateMode", key: "updateMode" },
              { title: "接口地址", dataIndex: "endpoint", key: "endpoint" },
              { title: "最近健康检查", dataIndex: "lastCheckAt", key: "lastCheckAt" },
              {
                title: "状态",
                dataIndex: "status",
                key: "status",
                render: (value: string) => <StatusTag status={value} />
              },
              {
                title: "操作",
                key: "actions",
                render: () => (
                  <Space>
                    <Button>编辑</Button>
                    <Button>查看映射</Button>
                  </Space>
                )
              }
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
