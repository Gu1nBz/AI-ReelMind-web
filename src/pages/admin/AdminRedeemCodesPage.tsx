import { Button, Card, Space, Table } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusTag } from "@/components/common/StatusTag";
import { redeemCodes } from "@/mock/data";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";

export function AdminRedeemCodesPage() {
  const ref = useAnimeEntrance("[data-animate-item]");

  return (
    <AdminLayout>
      <div className="rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="兑换码管理"
            title="兑换码管理"
            extra={
              <Space>
                <Button>批量导出 CSV</Button>
                <Button type="primary">批量生成兑换码</Button>
              </Space>
            }
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="id"
            scroll={{ x: 1024 }}
            dataSource={redeemCodes}
            columns={[
              { title: "兑换码", dataIndex: "code", key: "code" },
              { title: "积分", dataIndex: "credits", key: "credits" },
              { title: "批次号", dataIndex: "batchNo", key: "batchNo" },
              { title: "渠道", dataIndex: "channel", key: "channel" },
              {
                title: "状态",
                dataIndex: "status",
                key: "status",
                render: (value: string) => <StatusTag status={value} />
              },
              { title: "使用用户", dataIndex: "usedBy", key: "usedBy" },
              { title: "使用时间", dataIndex: "usedAt", key: "usedAt" },
              { title: "过期时间", dataIndex: "expiresAt", key: "expiresAt" }
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
