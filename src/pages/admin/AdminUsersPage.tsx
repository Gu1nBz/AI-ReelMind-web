import { Card, Table } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { users } from "@/mock/data";
import { formatCredits } from "@/utils/format";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";

export function AdminUsersPage() {
  const ref = useAnimeEntrance("[data-animate-item]");

  return (
    <AdminLayout>
      <div className="rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="用户管理"
            title="用户管理"
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="id"
            scroll={{ x: 1024 }}
            dataSource={users}
            columns={[
              { title: "用户 ID", dataIndex: "id", key: "id" },
              { title: "邮箱", dataIndex: "email", key: "email" },
              {
                title: "当前余额",
                dataIndex: "credits",
                key: "credits",
                render: (value: number) => formatCredits(value)
              },
              {
                title: "累计充值",
                dataIndex: "totalRecharge",
                key: "totalRecharge",
                render: (value: number) => formatCredits(value)
              },
              {
                title: "累计消耗",
                dataIndex: "totalConsumed",
                key: "totalConsumed",
                render: (value: number) => formatCredits(value)
              },
              { title: "最近登录", dataIndex: "lastLogin", key: "lastLogin" },
              { title: "注册时间", dataIndex: "registeredAt", key: "registeredAt" }
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
