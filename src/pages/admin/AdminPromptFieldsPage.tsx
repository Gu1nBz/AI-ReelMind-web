import { Button, Card, Table } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { advancedPromptFields } from "@/mock/data";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";

export function AdminPromptFieldsPage() {
  const ref = useAnimeEntrance("[data-animate-item]");

  return (
    <AdminLayout>
      <div className="rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="高级提示词"
            title="提示词字段"
            extra={<Button type="primary">新增字段</Button>}
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="key"
            pagination={false}
            dataSource={advancedPromptFields}
            columns={[
              { title: "字段 Key", dataIndex: "key", key: "key" },
              { title: "字段名称", dataIndex: "label", key: "label" },
              { title: "控件类型", dataIndex: "type", key: "type" },
              { title: "说明", dataIndex: "description", key: "description" },
              {
                title: "必填",
                dataIndex: "required",
                key: "required",
                render: (value: boolean) => (value ? "是" : "否")
              }
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
